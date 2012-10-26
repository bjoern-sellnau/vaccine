make build 1> /dev/null
if test "X$(git diff --stat)" = X
then
  git push heroku master
else
  echo "Working directory not clean. Did you forget to build?" >&2
  exit 1
fi
