const getPagination = (pageQuery, total, defaultLimit = 10) => {
  const pageParam = parseInt(pageQuery, 10);
  const currentPage =
    Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const limit = defaultLimit;

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(currentPage, totalPages);
  const skip = (safePage - 1) * limit;

  return {
    currentPage: safePage,
    totalPages,
    skip,
    limit,
  };
};

module.exports = { getPagination };

