# BETTER-SQLITE3 NAPI DOWNLOAD

mkdir napi
version="v7.5.3"
napi_builds=('better-sqlite3-v7.5.3-node-v72-darwin-x64.tar.gz' 'better-sqlite3-v7.5.3-node-v72-linux-x64.tar.gz' 'better-sqlite3-v7.5.3-node-v72-win32-x64.tar.gz' 'better-sqlite3-v7.5.3-node-v72-darwin-arm64.tar.gz')

for i in "${napi_builds[@]}"
do
    echo "https://github.com/WiseLibs/better-sqlite3/releases/download/${version}/${i}"
    curl -LJO "https://github.com/WiseLibs/better-sqlite3/releases/download/${version}/${i}"
    tar -xf "${i}" -C "napi"
    regex='([^-]+)-([^-]+)\.tar\.gz'
    [[ "${i}" =~ $regex ]]
    platform="${BASH_REMATCH[1]}"
    arch="${BASH_REMATCH[2]}"
    echo "${platform}-${arch}"
    mv "napi/build/Release/better_sqlite3.node" "napi/better_sqlite3-${platform}-${arch}.node"
    rm "${i}"
    rm -rf "napi/build"
done

# journeyapps-node-binary NAPI DOWNLOAD

version="v5.3.1"

curl -LJO "https://journeyapps-node-binary.s3.amazonaws.com/@journeyapps/sqlcipher/${version}/napi-v6-win32-x64.tar.gz"
tar -xf "napi-v6-win32-x64.tar.gz" -C "napi/"
rm napi-v6-win32-x64.tar.gz

curl -LJO "https://journeyapps-node-binary.s3.amazonaws.com/@journeyapps/sqlcipher/${version}/napi-v6-darwin-x64.tar.gz"
tar -xf "napi-v6-darwin-x64.tar.gz" -C "napi/"
rm napi-v6-darwin-x64.tar.gz

curl -LJO "https://journeyapps-node-binary.s3.amazonaws.com/@journeyapps/sqlcipher/${version}/napi-v6-linux-x64.tar.gz"
tar -xf "napi-v6-linux-x64.tar.gz" -C "napi/"
rm napi-v6-linux-x64.tar.gz
