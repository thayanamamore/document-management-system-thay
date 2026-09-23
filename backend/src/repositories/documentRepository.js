const documents = new Map();

function create(document) {
  documents.set(document.id, document);
  return document;
}

function findAll(owner) {
  const allDocuments = Array.from(documents.values());
  return owner ? allDocuments.filter((document) => document.owner === owner) : allDocuments;
}

function findById(id) {
  return documents.get(id);
}

module.exports = {
  create,
  findAll,
  findById,
};
