const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

function readJSON(filename) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]', 'utf-8');
    return [];
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

function writeJSON(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function findById(filename, id) {
  const data = readJSON(filename);
  return data.find(item => item.id === id) || null;
}

function upsert(filename, item) {
  const data = readJSON(filename);
  const idx = data.findIndex(d => d.id === item.id);
  if (idx >= 0) {
    data[idx] = { ...data[idx], ...item };
  } else {
    data.push(item);
  }
  writeJSON(filename, data);
  return item;
}

function remove(filename, id) {
  let data = readJSON(filename);
  data = data.filter(d => d.id !== id);
  writeJSON(filename, data);
}

module.exports = { readJSON, writeJSON, findById, upsert, remove };
