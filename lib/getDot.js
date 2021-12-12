
/**
 * Given a starting variable returns a graph of its dependencies in a dot format.
 */
export function getDot(startFrom) {
  let nodes = getTopologicalOrder(startFrom);
  let dot = ['digraph G {']
  let isCompiled = startFrom.ns.isCompiled();
  let formatValue = (options && options.formatValue) || (v => v.toFixed(2));
  let formatGradient = (options && options.formatGradient) || (v => '| ' + v.toFixed(2));

  nodes.forEach((node, i) => {
    node.graphId = i;
    let nodeAttributes = isCompiled ? 
      `[label="${node.uiName}\\n${formatValue(node.getValue())} ${formatGradient(node.getGradient())}"]` : `[label="${node.uiName}"]`;
    dot.push(`${node.graphId} ${nodeAttributes}`);
  });
  let edges = new Set()
  nodes.forEach(node => {
    node.children.forEach(child => {
      let edgeId = node.graphId + '_' + child.graphId;
      if (edges.has(edgeId)) return;
      edges.add(edgeId);
      dot.push(`${node.graphId} -> ${child.graphId}`);
    });
  });
  dot.push('}');
  return dot.join('\n');
}