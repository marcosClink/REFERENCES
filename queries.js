
const query = {
deleteTrans: `delete from ref_doc WHERE doc_unique = ?;`,
docFiles: 'SELECT doc_unique, ref_num FROM ref_doc;'

};

module.exports = query;