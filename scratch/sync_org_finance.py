import os
import sys
import pexpect

FILES_TO_SYNC = [
    ("packages/db/prisma/schema.prisma", "/root/grekam-os/packages/db/prisma/schema.prisma"),
    ("apps/api/src/settings/organization.router.ts", "/root/grekam-os/apps/api/src/settings/organization.router.ts"),
    ("apps/api/src/settings/finance.router.ts", "/root/grekam-os/apps/api/src/settings/finance.router.ts"),
    ("apps/web/app/dashboard/settings/organization/page.tsx", "/root/grekam-os/apps/web/app/dashboard/settings/organization/page.tsx"),
    ("apps/web/app/dashboard/settings/finance/page.tsx", "/root/grekam-os/apps/web/app/dashboard/settings/finance/page.tsx"),
    ("apps/web/app/dashboard/settings/page.tsx", "/root/grekam-os/apps/web/app/dashboard/settings/page.tsx"),
    ("apps/web/src/config/navigation.ts", "/root/grekam-os/apps/web/src/config/navigation.ts"),
    ("apps/academy-web/app/dashboard/settings/finance/page.tsx", "/root/grekam-os/apps/academy-web/app/dashboard/settings/finance/page.tsx"),
]

def scp_file(local_path, remote_path):
    print(f"Syncing {local_path} -> {remote_path}...")
    child = pexpect.spawn('/usr/bin/scp', [
        '-o', 'StrictHostKeyChecking=no',
        '-o', 'PubkeyAuthentication=no',
        local_path,
        f"root@72.61.231.187:{remote_path}"
    ], timeout=60)
    
    idx = child.expect([r'[pP]assword:', pexpect.EOF, pexpect.TIMEOUT])
    if idx == 0:
        child.sendline(os.environ.get('VPS_PASSWORD', ''))
        child.expect(pexpect.EOF)
        print(f"Successfully uploaded {local_path}")
    else:
        print(f"Error copying {local_path}: {child.before.decode()}")

def run_remote(cmd, timeout=300):
    print(f"\nRunning remote command: {cmd}")
    child = pexpect.spawn('/usr/bin/ssh', [
        '-o', 'StrictHostKeyChecking=no',
        '-o', 'PubkeyAuthentication=no',
        'root@72.61.231.187',
        cmd
    ], timeout=timeout)
    idx = child.expect([r'[pP]assword:', pexpect.EOF, pexpect.TIMEOUT])
    if idx == 0:
        child.sendline(os.environ.get('VPS_PASSWORD', ''))
        child.expect(pexpect.EOF)
        output = child.before.decode()
        print(output[-1500:] if len(output) > 1500 else output)
        return output
    else:
        print("Error executing remote command:", child.before.decode())
        return ""

if __name__ == '__main__':
    base_dir = "/Users/stalinkumar/Documents/visuals_pro_web/grekam-os"
    for local_rel, remote_abs in FILES_TO_SYNC:
        full_local = os.path.join(base_dir, local_rel)
        scp_file(full_local, remote_abs)
    
    print("\n--- 1. Generating Prisma Client on VPS ---")
    run_remote("cd /root/grekam-os/packages/db && npx prisma generate")

    print("\n--- 2. Rebuilding API on VPS ---")
    run_remote("cd /root/grekam-os/apps/api && npm run build && pm2 restart 2")
    
    print("\n--- 3. Rebuilding Web on VPS ---")
    run_remote("cd /root/grekam-os/apps/web && npm run build && pm2 restart 8")
    
    print("\n--- 4. PM2 Status ---")
    run_remote("pm2 list")
