/* jshint strict: false */
/*global RiTa, RiString, RiGrammar, RiMarkov, $*/

var contentMarkov = new RiMarkov(4);

function generateTitle() {
    $.getJSON("title.json", function (str) {
        var titleContent = new RiGrammar(str).expand();
        $('#title').text(titleContent);
    });
}

function generateAuthor() {
    $.getJSON("author.json", function (str) {
        var authorName = new RiGrammar(str).expand();
        $('#author').text(authorName);
    });
}

function generateAbstract() {
    $.getJSON("abstract.json", function (str) {
        var abstractContent = new RiGrammar(str).expand();
        $('#abstract').text(abstractContent);
    });
}

// Generate the headers. Take 3-8 tokens, make them lowercase.
// Replace special characters with a space and then make the first char uppercase.
// Append to content.
function generateHeader() {
    var header = contentMarkov.generateTokens(RiTa.random(3, 8));
    var stringHeader = header.toString().toLowerCase();
    stringHeader = stringHeader.replace(/\(|\)|,|\./g, " ");
    stringHeader = stringHeader.charAt(0).toUpperCase() + stringHeader.slice(1);
    $('#content').append("<h2>" + stringHeader + "</h2>");
}

function generateContent(str) {
    contentMarkov.loadText(str);
    if (contentMarkov.ready()) {
        var chapterNum = RiTa.random(3, 10);
        for (var i = 0; i < chapterNum; i++) {
            if (i === 0) {
                $('#intro').append("Introduction");
            } else {
                generateHeader();
            }
            var sentences = contentMarkov.generateSentences(RiTa.random(5, 20));
            // RiTa generates an array of sentences that end in a ',' and we need to strip that away
            // Now we lose all commas, a smarter solution would only remove those that are
            // on the borders of chains. For some reason trying to do that messed with the
            // chain generation, so lets stay stupid for now.
            $('#content').append(sentences.toString().replace(/,/g, " "));
        }
    }
}

function generateReferences(references) {
    var lines = references.split('\n'); // Split at new lines
    var uniqueLines = lines.filter(function (elem, pos) { // Remove duplicates,
       return lines.indexOf(elem) == pos;                 // only works if the lines are exact duplicates.
    });
    uniqueLines.sort(); // Sort into alphabetical order
    $.each(uniqueLines, function (index, value) {
        $('#references').append(index + 1 + ". " + value + "<br>"); // Write each reference and end with a line change
    });
}

function loadText() {

    // Load main text
    // This is done with RiTa so we get a nice
    // corpus to play with
    RiTa.loadString("corpus.txt", function (str) {
        if (str !== null) {
            generateTitle();
            generateAuthor();
            generateAbstract();
            generateContent(str);
        } else {
            $('#content').text("Corpus unavailable!");
        }
    });

    // Load references
    $.get('references.txt', function (references) {
        if (references !== null) {
            generateReferences(references);
        } else {
            $('#references').text("References!");
        }
    });

}
