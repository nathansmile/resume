name=resumefe-2

rm -rf _build/$name _build/$name.zip
npm run build

cp -rf dist dist2
mv dist2 _build/$name

cd _build
zip -r $name.zip $name