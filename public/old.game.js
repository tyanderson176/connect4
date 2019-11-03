function generateTable(numRows, numCols, headRows) {
  table = document.createElement('table');
  for(var n = 0; n < headRows-1; ++n)
    appendRow(table, numCols, '');
  headerRow(table, numCols);
  for(var n = 0; n < numRows; ++n)
    appendRow(table, numCols, '_');
  return table; 
}

function headerRow(table, numCols) {
  headers = document.createElement('tr');
  for(var n = 0; n < numCols; ++n) {
    headerElem = document.createElement('th');
    headerElem.innerText += n;
    headers.append(headerElem);
  }
  table.append(headers);
}

function appendRow(table, numCols, filler) {
  row = document.createElement('tr');
  for(var n = 0; n < numCols; ++n) {
    rowElem = document.createElement('td')
    rowElem.innerText += filler;
    row.append(rowElem);
  }
  table.append(row);
}

function board() {
  const numRows = 6, numCols = 7, headRows = 2;
  this.html_table = generateTable(numRows, numCols, headRows);

  this.fetchEmpty = function (column) {
    rows = this.html_table.children;
    for(var r_id = 0; r_id < rows.length; ++r_id) {
      col = rows[r_id].children[column];
      if (col.innerText != "_" && r_id >= headRows)
        return r_id-1 >= headRows ? rows[r_id-1].children[column] : null;
    }
    return rows[rows.length-1].children[column];
  };

  this.fetchEntry = function (row, column) {
    rows = this.html_table.children;
    return rows[row + headRows].children[column];
  };

  this.set = function (board) {
    for(var r = 0; r < numRows; ++r) {
      for(var c = 0; c < numCols; ++c) {
        sym = board[r][c] == null ? '_' : board[r][c] == 0 ? '@' : 'O';
        this.fetchEntry(r, c).innerText = sym
      }
    }
  }

  this.insertAt = (column, sym) => {
    if (column < 0 || column >= numCols)
      return;
    entry = this.fetchEmpty(column); 
    if (entry)
      entry.innerText = sym;
    return entry != null;
  };

  this.putPointer = col => { 
    if (col < 0 || col >= numCols)
      return;
    this.pointerColumn = col;
    row = this.html_table.children[0].children;
    for(var n = 0; n < row.length; ++n)
      row[n].innerText = '';
    row[col].innerText = '*';
  };

  this.putPointer(0);
};

b = new board();

module.exports = {
  board,
};
