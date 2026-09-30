import os
import sys
import pexpect

FILES_TO_SYNC = [
    ("apps/web/app/globals.css", "/root/grekam-os/apps/web/app/globals.css"),
    ("apps/web/app/dashboard/layout.tsx", "/root/grekam-os/apps/web/app/dashboard/layout.tsx"),
    ("apps/web/app/dashboard/page.tsx", "/root/grekam-os/apps/web/app/dashboard/page.tsx"),
    ("apps/web/src/components/layout/sidebar.tsx", "/root/grekam-os/apps/web/src/components/layout/sidebar.tsx"),
    ("apps/web/app/dashboard/settings/organization/page.tsx", "/root/grekam-os/apps/web/app/dashboard/settings/organization/page.tsx"),
    ("apps/web/app/dashboard/settings/finance/page.tsx", "/root/grekam-os/apps/web/app/dashboard/settings/finance/page.tsx"),
    ("apps/web/app/dashboard/settings/page.tsx", "/root/grekam-os/apps/web/app/dashboard/settings/page.tsx"),
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

def run_remote(cmd, timeout=400):
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
        print(output[-2000:] if len(output) > 2000 else output)
        return output
    else:
        print("Error executing remote command:", child.before.decode())
        return ""

if __name__ == '__main__':
    base_dir = "/Users/stalinkumar/Documents/visuals_pro_web/grekam-os"
    for local_rel, remote_abs in FILES_TO_SYNC:
        full_local = os.path.join(base_dir, local_rel)
        scp_file(full_local, remote_abs)
    
    print("\n--- Building apps/web on VPS ---")
    build_output = run_remote("cd /root/grekam-os/apps/web && npm run build")
    
    print("\n--- Restarting PM2 process 8 (grekam-os-web) ---")
    run_remote("pm2 restart 8 && pm2 list")
    
    print("\n--- Verifying Web HTTP Status ---")
    run_remote("curl -sI http://127.0.0.1:3000/dashboard | head -n 10")
