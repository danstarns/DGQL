// Stolen from https://github.com/TristanPerry/cypher-query-formatter
function formatCypher(cypher) {
  // a primitive regex approach, based loosely on the Cypher style guide at: https://neo4j.com/developer/cypher-style-guide/

  // "Keywords, similar to clauses, should be styled in all capital letters and are not case-sensitive, but do not need to be placed on a separate line."
  cypher = cypher.replace(
    /\b(WHEN|CASE|AND|OR|XOR|DISTINCT|AS|IN|STARTS WITH|ENDS WITH|CONTAINS|NOT|SET|ORDER BY)\b/gi,
    function (match) {
      return " " + match.toUpperCase().trim() + " ";
    }
  );

  // "The null value and boolean literals should be written in lower case in a cypher."
  cypher = cypher.replace(/\b(NULL|TRUE|FALSE)\b/gi, function (match) {
    return " " + match.toLowerCase().trim() + " ";
  });

  // Now ensure that all 'main' Cypher keywords are on a new line
  cypher = cypher.replace(
    /\b(CASE|DETACH DELETE|DELETE|MATCH|MERGE|LIMIT|OPTIONAL MATCH|RETURN|UNWIND|UNION|WHERE|WITH|GROUP BY)\b/gi,
    function (match) {
      // ".replace(/^\s+/,"")" removes whitespace from the start of the line (safer than using "trimStart()" right now)
      return "\n" + match.toUpperCase().replace(/^\s+/, "") + " ";
    }
  );

  // some whitespace clean-up
  cypher = cypher.replace(/^\s+/gm, ""); // remove whitespace from start of lines

  cypher = cypher.replace(/\s+$/gm, ""); // remove whitespace from end of lines

  // "One space after each comma in lists and enumerations."
  cypher = cypher.replace(/,([^\s])/g, function (match) {
    return ", " + match.replace(/,/g, "");
  });

  cypher = cypher.replace(/ +/g, " "); // replace multiple spaces with single space

  // "We can also make queries a bit easier to read by indenting ON CREATE or ON MATCH and any subqueries. Each of these blocks is indented with 2 spaces on a new line."
  cypher = cypher.replace(/\b(ON CREATE|ON MATCH)\b/gi, function (match) {
    return "\n  " + match.toUpperCase().replace(/^\s+/, "") + " ";
  });
  cypher = cypher.replace(/ {([\S\s]*?)}/g, function (match) {
    let block = match
      .trim()
      .substring(1, match.trim().length - 1)
      .trim();
    return " {\n  " + block.replace(/(\r\n|\n|\r)/gm, "\n  ") + "\n}";
  });

  cypher = cypher.replace(/\n\s*\n/g, "\n"); // remove multiple empty newlines

  return cypher.trim();
}

export default formatCypher;
