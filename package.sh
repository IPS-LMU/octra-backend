app=$1
target=$2
regex='node([0-9]+)-([^-]+)-([^-]+)'
[[ "${target}" =~ $regex ]]
system="${BASH_REMATCH[2]}"
arch="${BASH_REMATCH[3]}"
platform=""

echo "-> Build binary for CLI ${system}-${arch}"

case $system in
macos)
  platform="darwin"
  ;;
linux)
  platform="linux"
  ;;
win)
  platform="win32"
  ;;
esac

platform="${platform}-${arch}"
echo $platform

# remove custom napi files
rm node_modules/better-sqlite3/build/Release/better_sqlite3*
rm -rf "node_modules/@journeyapps/sqlcipher/lib/binding"
mkdir "node_modules/@journeyapps/sqlcipher/lib/binding"

# add custom napi files
cp "napi/better_sqlite3-${platform}.node" "node_modules/better-sqlite3/build/Release/"
cp -rf "napi/napi-v6-${platform}" "node_modules/@journeyapps/sqlcipher/lib/binding/"

pkg "./dist/apps/${app}/main.js" --compress GZip -c "./dist/apps/${app}/package.json" -t "$target" -o "dist/builds/${app}-${system}-${arch}"
