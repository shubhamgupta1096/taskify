const requestChecker = (obj) => {
  const keys = Object.keys(obj);

  const emptyFields = [];
  for (const key of keys) {
    if (!obj[key] && typeof obj[key] !== "boolean") {
      emptyFields.push(key);
    }
  }

  if (emptyFields.length) {
    return `${emptyFields.join(", ")} field(s) required`;
  }
  return null;
};

module.exports = requestChecker;
