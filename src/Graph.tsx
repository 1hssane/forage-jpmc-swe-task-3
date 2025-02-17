import React, { Component } from 'react';
import { Table, TableData } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import './Graph.css';
import { DataManipulator } from './DataManipulator';

/**
 * Props declaration for <Graph />
 */
interface IProps {
  data: ServerRespond[],
}

/**
 * Perspective library adds load to HTMLElement prototype.
 * This interface acts as a wrapper for Typescript compiler.
 */
interface PerspectiveViewerElement extends HTMLElement{
  load: (table: Table) => void,
}

/**
 * React component that renders Perspective based on data
 * parsed from its parent through data property.
 */
class Graph extends Component<IProps, {}> {
  // Perspective table
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element to attach the table from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;
    elem.setAttribute('view','y_line');
    elem.setAttribute('row-pivots','["timestamp"]');
    elem.setAttribute('columns','["ratio"],["lower_bound"],["upper_bound"],["trigger_alert"]');
    elem.setAttribute('aggregates',JSON.stringify({
       price_abc:'avg',
       price_def:'avg',
       ratio:'avg',
       timestamp:'distant count',
       upper_bound : 'avg',
       lower_bound : 'avg',
       trigger_alert :'avg',

    }));
  
    const schema = {
      price_abc: 'float',
      price_def: 'float',
      timestamp: 'date',
      ratio: 'float',
      upper_bound: 'float',
      lower_bound: 'float',
      trigger_alert: 'float',
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.

      // Add more Perspective configurations here.
      elem.load(this.table);
    }
  }

  componentDidUpdate() {
    // Everytime the data props is updated, insert the data into Perspective table
    if (this.table) {
      // As part of the task, you need to fix the way we update the data props to
      // avoid inserting duplicated entries into Perspective table again.
      this.table.update([
        
        DataManipulator.generateRow(this.props.data),

      ] as unknown as TableData );
    }
  }
}

export default Graph;