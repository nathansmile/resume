name=resumefe-2

rm -rf _build/$name _build/$name.zip
npm run build
mkdir -p _build/$name

cp -rf dist _build/$name/

cd _build
zip -r $name.zip $name