version="v5.0.8"

curl -LJO "https://github.com/TryGhost/node-sqlite3/releases/download/${version}/napi-v6-win32-unknown-x64.tar.gz"
tar -xf "napi-v6-win32-unknown-x64.tar.gz" -C "node_modules/sqlite3/lib/binding"
rm napi-v6-win32-unknown-x64.tar.gz
