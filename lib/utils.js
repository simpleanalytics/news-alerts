const removeTags = (str) => {
  return str?.replace?.(/<[^>]*>/g, "").replace(/&nbsp;\.\.\./g, "");
};

const decodeHTML = (str) => {
  var map = { gt: ">" /* , … */ };
  return str.replace(/&(#(?:x[0-9a-f]+|\d+)|[a-z]+);?/gi, function ($0, $1) {
    if ($1[0] === "#") {
      return String.fromCharCode(
        $1[1].toLowerCase() === "x"
          ? parseInt($1.substr(2), 16)
          : parseInt($1.substr(1), 10)
      );
    } else {
      return map.hasOwnProperty($1) ? map[$1] : $0;
    }
  });
};

const cleanText = (str) => {
  return removeTags(decodeHTML(str));
};

const loop = (func, { start, interval }) => {
  if (!start) start = Date.now() - interval;
  const now = Date.now();
  const elapsed = now - start;
  start = Date.now();
  const waiting = Math.max(interval - elapsed, 0);

  setTimeout(async () => {
    func()
      .then(() => loop(func, { start, interval }))
      .catch(() => loop(func, { start, interval }));
  }, waiting);
};

module.exports = {
  removeTags,
  decodeHTML,
  cleanText,
  loop,
};
