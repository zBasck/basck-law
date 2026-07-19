// backend/middleware/asyncHandler.js
// Envolve controllers async para que erros sincronos e rejeitados cheguem ao errorHandler.
function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
module.exports = { asyncHandler };
