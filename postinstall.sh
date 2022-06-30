# BETTER-SQLITE3 NAPI DOWNLOAD

mkdir napi
version="v7.5.2"

napi_builds=("better-sqlite3-multiple-ciphers-${version}-node-v72-darwin-x64.tar.gz" "better-sqlite3-multiple-ciphers-${version}-node-v72-linux-x64.tar.gz" "better-sqlite3-multiple-ciphers-${version}-node-v72-win32-x64.tar.gz")
url="https://github.com/m4heshd/better-sqlite3-multiple-ciphers/releases/download/${version}"
for i in "${napi_builds[@]}"
do
    echo "${url}/${i}"
    curl -LJO "${url}/${i}"
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
