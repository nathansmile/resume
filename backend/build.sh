name=resumebe-1

rm -rf _build/$name _build/$name.zip
npm run build
mkdir -p _build/$name

cp -rf dist _build/$name/
cp -rf prisma _build/$name/
cp -rf src _build/$name/
cp -rf .env _build/$name/
cp -rf package.json _build/$name/

cd _build
zip -r $name.zip $name