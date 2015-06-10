/* jshint strict: false */
/*global RiTa, RiString, RiGrammar, RiMarkov, $*/

var contentMarkov = new RiMarkov(4);
var chapterMin = 3;
var chapterMax = 5;

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
function generateHeading() {
    var heading = contentMarkov.generateTokens(RiTa.random(3, 8));
    var stringHeading = heading.toString().toLowerCase();
    stringHeading = stringHeading.replace(/\(|\)|,|\./g, " ");
    stringHeading = stringHeading.charAt(0).toUpperCase() + stringHeading.slice(1);
    return stringHeading;
}

function generateSentences(min, max) {
    var sentences = contentMarkov.generateSentences(RiTa.random(min, max));
    return sentences;
}

function generateChapter(heading, sentences) {
    $('#content').append("<h2>" + heading + "</h2>");
    $('#content').append(sentences.toString().replace(/,/g, " "));
}

function generateContent(str) {
    contentMarkov.loadText(str);
    if (contentMarkov.ready()) {
        var chapterNum = RiTa.random(chapterMin, chapterMax);
        for (var i = 0; i <= chapterNum; i++) {
            var heading;
            var sentences;
            if (i === 0) {
                heading = "Introduction";
            } else {
                heading = generateHeading();
            }
            sentences = generateSentences(3, 10);
            generateChapter(heading, sentences);
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
