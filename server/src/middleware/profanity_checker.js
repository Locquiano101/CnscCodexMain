import { Filter } from "bad-words";

const filter = new Filter();

export const profanityMiddleware = (req, res, next) => {
  const content = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (filter.isProfane(content)) {
    return res.status(400).json({
      error: "Profanity detected",
    });
  }

  next();
};
