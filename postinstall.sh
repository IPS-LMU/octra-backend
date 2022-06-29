# journeyapps-node-binary NAPI DOWNLOAD

mkdir napi
version="v5.3.1"
napi_builds=('napi-v6-win32-x64.tar.gz' 'napi-v6-darwin-x64.tar.gz' 'napi-v6-linux-x64.tar.gz' 'napi-v6-darwin-arm64.tar.gz')

for i in "${napi_builds[@]}"
do
    echo "https://journeyapps-node-binary.s3.amazonaws.com/@journeyapps/sqlcipher/${version}/${i}"
    curl -LJO "https://journeyapps-node-binary.s3.amazonaws.com/@journeyapps/sqlcipher/${version}/${i}"
    tar -xf "${i}" -C "napi"
    rm "${i}"
done
