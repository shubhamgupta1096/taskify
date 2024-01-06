const isValidDateString = (dateString) => {
  const dateParts = dateString.split("-");

  if (dateParts.length !== 3) {
    return false;
  }

  const [year, month, day] = dateParts;

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return false;
  }

  if (year.length !== 4 || month.length !== 2 || day.length !== 2) {
    return false;
  }

  // Check if the resulting date is a valid date
  const parsedDate = new Date(`${year}-${month}-${day}`);
  return !isNaN(parsedDate.getTime());
};

module.exports = isValidDateString;
