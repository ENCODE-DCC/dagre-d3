
/**
 * Draws a box currently inside the top edge of a node with an optional icon drawn inside, though
 * future development would include other positions as needed.
 */

module.exports = addDecoration;


/** Override the default decoration width and height with node.decoration.width and .height */
var DEFAULT_DECORATION_WIDTH = 26;
var DEFAULT_DECORATION_HEIGHT = 14;
var DEFAULT_DECORATION_POSITION = 'top';


// Defined icon variants. Add other variants to this object as needed.
var iconDefs = {
  // Arrow head pointing right.
  'arrow-right': function(decorationGroup, decorationWidth, decorationHeight) {
      var bbox = decorationGroup.node().getBBox();
      decorationGroup
        .attr("d", d3.svg.symbol().type('triangle-up').size(34))
        .attr("transform", "translate(0," + (decorationHeight / 2) + ") rotate(90)");
      return decorationGroup;
  },
};


/**
 * Add a decoration to the node in the requested position.
 */
function addDecoration(root, node) {
  var decorationWidth = node.decoration.width || DEFAULT_DECORATION_WIDTH;
  var decorationHeight = node.decoration.height || DEFAULT_DECORATION_HEIGHT;
  var decorationPosition = node.decoration.position || DEFAULT_DECORATION_POSITION;
  var decorationGroup = root.append("g").attr("class", "decoration" + (node.decoration.class ? " " + node.decoration.class : ""));
  var horzStart = decorationWidth / 2;

  // Add more decoration positions as needed.
  if (decorationPosition === "top") {
    // Draw the rectangle for the decoration.
    decorationGroup.append("rect")
      .attr("x", -horzStart)
      .attr("y", 1)
      .attr("width", decorationWidth)
      .attr("height", decorationHeight);

    // Draw the three-sided border around the decoration.
    decorationGroup.append("polyline")
      .attr("class", "decoration__border")
      .attr("points", -horzStart + ",0 " + -horzStart + "," + (decorationHeight + 1) + " " + horzStart + "," + (decorationHeight + 1) + " " + horzStart + ",0");
  }

  // Draw any requested icon in the middle of the decoration.
  if (node.decoration.icon) {
    var decorationPath = decorationGroup.append("path")
      .attr("class", "decoration__icon")
    iconDefs[node.decoration.icon](decorationPath, decorationWidth, decorationHeight);
  }

  return decorationGroup;
}
