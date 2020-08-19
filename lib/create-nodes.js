"use strict";

var _ = require("./lodash"),
    addLabel = require("./label/add-label"),
    addSubnodes = require("./add-subnodes"),
    addDecoration = require("./add-decoration"),
    util = require("./util"),
    d3 = require("./d3");

module.exports = createNodes;

/**
 * Create the nodes that have been set in a dagre-d3 graph within a d3 selection. Each node
 * definition in `g` includes a shape for that node, and the `shapes` parameter includes
 * renderers for every defined kind of shape.
 * @param {object} selection d3 selection to create the nodes within
 * @param {object} g dagre-d3 graph containing the node definitions
 * @param {object} shapes pre-defined node shapes
 */
function createNodes(selection, g, shapes) {
  var simpleNodes = g.nodes().filter(function(v) { return !util.isSubgraph(g, v); });
  var svgNodes = selection.selectAll("g.node")
    .data(simpleNodes, function(v) { return v; })
    .classed("update", true);

  svgNodes.selectAll("*").remove();
  svgNodes.enter()
    .append("g")
      .attr("class", "node")
      .style("opacity", 0);
  svgNodes.each(function(v) {
    var subnodeGroup, subnodeDom;
    var decorationGroup;
    var subnodeBBox = {width: 0, height: 0};
    var node = g.node(v),
        thisGroup = d3.select(this),
        labelGroup = thisGroup.append("g").attr("class", "label"),
        labelDom = addLabel(labelGroup, node),
        shape = shapes[node.shape],
        bbox = _.pick(labelDom.node().getBBox(), "width", "height");

    node.elem = this;

    // If the node has subnodes, add them to the node and modify the bbox.
    if (node.subnodes && node.subnodes.length) {
      subnodeGroup = addSubnodes(thisGroup, node);

      // Calculate the box surrounding the subnode elements. Adjust bbox to hold them.
      subnodeBBox = _.pick(subnodeGroup.node().getBBox(), "width", "height");
      bbox.height += subnodeBBox.height;
      bbox.width = Math.max(bbox.width, subnodeBBox.width);
    } else {
      // The node doesn't have subnodes.
      subnodeGroup = subnodeDom = null;
      subnodeBBox.width = subnodeBBox.height = 0;
    }

    // Render node decorations if specified.
    if (node.decoration) {
      decorationGroup = addDecoration(thisGroup, node);
      
      // Add margins to the node to give decorations some space.
      var decorationBBox = decorationGroup.node().getBBox();
      bbox.height += decorationBBox.height;
    }

    if (node.id) { thisGroup.attr("id", node.id); }
    if (node.labelId) { labelGroup.attr("id", node.labelId); }
    util.applyClass(thisGroup, node["class"],
      (thisGroup.classed("update") ? "update " : "") + "node");

    if (_.has(node, "width")) { bbox.width = node.width; }
    if (_.has(node, "height")) { bbox.height = node.height; }

    bbox.width += node.paddingLeft + node.paddingRight;
    bbox.height += node.paddingTop + node.paddingBottom;
    labelGroup.attr("transform", "translate(" +
      ((node.paddingLeft - node.paddingRight) / 2) + "," +
      ((node.paddingTop - node.paddingBottom - subnodeBBox.height) / 2) + ")");
    if (subnodeGroup) {
      subnodeGroup.attr("transform", "translate(" +
        -((subnodeBBox.width / 2) - 10) + "," +
        ((node.paddingTop - node.paddingBottom + subnodeBBox.height) / 2) + ")");
    }

    // Translate the decoration to pin it against one side of the parent node group.
    if (decorationGroup) {
      // Stacks and contributing files get drawn differently, so they need a vertical adjustment,
      // combined if requested.
      let clusterAdjustment = node.class.indexOf("contributing") !== -1 ? -1 : 0;
      clusterAdjustment += node.shape === "stack" ? -4 : 0;
      decorationGroup.attr("transform", "translate(0," + ((-bbox.height / 2) + clusterAdjustment) + ")");
    }

    var shapeSvg = shape(d3.select(this), bbox, node);
    util.applyStyle(shapeSvg, node.style);

    var shapeBBox = shapeSvg.node().getBBox();
    node.width = shapeBBox.width;
    node.height = shapeBBox.height;
  });

  util.applyTransition(svgNodes.exit(), g)
    .style("opacity", 0)
    .remove();

  return svgNodes;
}
