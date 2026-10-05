import { isIP } from "net";

/**
 * SSRF guards for the server-side preview proxy.
 *
 * This route fetches a caller-supplied URL from the server, which makes it a
 * request forwarder into whatever the host can reach: loopback services, RFC1918
 * networks and cloud metadata endpoints. An anonymous request previously reached
 * a local PostgreSQL instance. Hostname checks alone are not enough — a public
 * name can resolve to a private address — so this validates both the literal
 * host and the resolved addresses.
 */

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "ip6-localhost",
  "metadata",
  "metadata.google.internal",
  "instance-data",
]);

function ipv4IsPrivate(ip: string): boolean {
  const p = ip.split(".").map(Number);
  if (p.length !== 4 || p.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return true;
  const [a, b] = p;
  if (a === 0 || a === 10 || a === 127) return true;              // this-network, RFC1918, loopback
  if (a === 172 && b >= 16 && b <= 31) return true;                // RFC1918
  if (a === 192 && b === 168) return true;                          // RFC1918
  if (a === 169 && b === 254) return true;                          // link-local / metadata
  if (a === 100 && b >= 64 && b <= 127) return true;                // CGNAT
  if (a >= 224) return true;                                        // multicast + reserved
  return false;
}

function ipv6IsPrivate(ip: string): boolean {
  const addr = ip.toLowerCase().split("%")[0];
  if (addr === "::1" || addr === "::") return true;
  if (addr.startsWith("fe80")) return true;                         // link-local
  if (/^f[cd]/.test(addr)) return true;                             // unique local
  const mapped = addr.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);      // IPv4-mapped
  if (mapped) return ipv4IsPrivate(mapped[1]);
  return false;
}

export function isPrivateAddress(ip: string): boolean {
  const family = isIP(ip);
  if (family === 4) return ipv4IsPrivate(ip);
  if (family === 6) return ipv6IsPrivate(ip);
  return true; // not an IP literal; caller must resolve and check separately
}

/**
 * Returns an error string when the URL is not safe to fetch, or null when it is.
 * Callers must have already resolved DNS, or pass `resolvedAddresses`.
 */
export async function assertSafeUrl(
  rawUrl: string,
  resolvedAddresses?: string[]
): Promise<string | null> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return "Malformed URL.";
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return "Only http and https URLs are allowed.";
  }

  const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();

  if (BLOCKED_HOSTNAMES.has(host) || host.endsWith(".localhost") || host.endsWith(".internal")) {
    return "Requests to internal hosts are not allowed.";
  }

  const family = isIP(host);
  if (family !== 0 && isPrivateAddress(host)) {
    return "Requests to private or loopback addresses are not allowed.";
  }

  // Resolve and re-check, so a public hostname pointing at 127.0.0.1 is caught.
  let addresses = resolvedAddresses;
  if (!addresses) {
    if (family !== 0) {
      addresses = [host];
    } else {
      try {
        const { lookup } = await import("dns/promises");
        const results = await lookup(host, { all: true });
        addresses = results.map((r) => r.address);
      } catch {
        return "Could not resolve host.";
      }
    }
  }

  for (const addr of addresses) {
    if (isPrivateAddress(addr)) {
      return "Requests to private or loopback addresses are not allowed.";
    }
  }

  return null;
}