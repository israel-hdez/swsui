import * as React from 'react';
import Vizceral from 'vizceral-react';
import axios from 'axios';
import 'vizceral-react/dist/vizceral.css';
import './ServiceGraphPage.css';

type ServiceGraphState = {
  alertVisible: boolean;
  trafficData: any;
  vizceralView: Array<string>;
  currentView: Array<string>;
  selectedNode: any;
  objectHoveredName: string;
};

type ServiceGraphProps = {
  // none yet
};

type GraphBreadbrumbProps = {
  vizceralView: Array<string>;
  onViewChangeRequested: (view: Array<string>) => void;
};

class GraphBreadcrumb extends React.Component<GraphBreadbrumbProps> {
  constructor(props: GraphBreadbrumbProps) {
    super(props);

    this.viewSelected = this.viewSelected.bind(this);
  }

  render() {
    return (
      <div className="breadcrumb">
        <h3>You are here:</h3>
        <ul>
          <li>
            <a href="#" data-view-idx="0" onClick={this.viewSelected}>
              Root
            </a>
          </li>
          {this.props.vizceralView.map((val, idx) => (
            <li key={val}>
              <a href="#" data-view-idx={idx + 1} onClick={this.viewSelected}>
                {val}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  private viewSelected(e: any) {
    e.preventDefault();
    let clickedIdx: number = e.target.dataset.viewIdx;
    this.props.onViewChangeRequested(this.props.vizceralView.slice(0, clickedIdx));
  }
}

class SelectedNodeProps extends React.Component<any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    if (this.props.selectedNode == null) {
      return <div />;
    }

    let incomingConnections: Array<object> = [];
    let outgoingConnections: Array<object> = [];
    let notices: Array<object> = [];

    if (this.props.selectedNode.incomingConnections) {
      incomingConnections = [
        <dt key="ic">Incoming connections:</dt>,
        <dd key="icVal">{this.props.selectedNode.incomingConnections.length}</dd>
      ];
    }

    if (this.props.selectedNode.outgoingConnections) {
      outgoingConnections = [
        <dt key="oc">Outgoing connections:</dt>,
        <dd key="ocVal">{this.props.selectedNode.outgoingConnections.length}</dd>
      ];
    }

    if (this.props.selectedNode.notices && this.props.selectedNode.notices.length > 0) {
      notices = [
        <dt key="notice">Notice:</dt>,
        (
          <dd key="noticeLink">
            <a href={this.props.selectedNode.notices[0].link}>{this.props.selectedNode.notices[0].title}</a>
          </dd>
        )
      ];
    }

    return (
      <div>
        <h3>Selected node:</h3>
        <dl>
          <dt>Name:</dt>
          <dd>{this.props.selectedNode.displayName || this.props.selectedNode.name}</dd>
          {incomingConnections}
          {outgoingConnections}
          {notices}
        </dl>
      </div>
    );
  }
}

class ServiceGraphPage extends React.Component<ServiceGraphProps, ServiceGraphState> {
  vizceralStyles: object;

  constructor(props: ServiceGraphProps) {
    super(props);

    this.vizceralViewChanged = this.vizceralViewChanged.bind(this);
    this.handleViewChangeRequest = this.handleViewChangeRequest.bind(this);
    this.handleObjectHightlighted = this.handleObjectHightlighted.bind(this);
    this.handleObjectHovered = this.handleObjectHovered.bind(this);
    this.fetchAndShowData = this.fetchAndShowData.bind(this);

    console.log('Starting ServiceGraphPage');
    this.state = {
      alertVisible: true,
      trafficData: {},
      vizceralView: [],
      currentView: [],
      selectedNode: null,
      objectHoveredName: ''
    };

    this.vizceralStyles = {
      colorText: 'rgb(0, 255, 0)', // ??
      colorTextDisabled: 'rgb(0, 0, 255)', // ??

      colorTraffic: {
        // The dots flying in the edges (representing "success"), the border of
        // the circles/donuts, the color of the numbers in the donut, the fill
        // color of the labels/rectangles, the color of the "dot" of the nodes
        // in the detail view.
        normal: 'rgb(30, 30, 30)',

        normalDonut: 'rgb(255, 240, 0)', // ??

        // Dots flying representing warnings
        warning: 'rgb(0, 180, 0)',

        // Dots flying representing danger
        danger: 'rgb(255, 0, 0)'
      },

      // Color of the labels inside the donut (text on top of the numbers)
      colorNormalDimmed: 'rgb(50, 115, 140)',

      colorBackgroundDark: 'rgb(0, 0, 255)',

      // The text of the labels; i.e. the text next to the nodes and enclosed in a rectangle.
      colorLabelText: 'rgb(255, 255, 255)',

      // The border of the box of the labels
      colorLabelBorder: 'rgb(0, 0, 0)',

      // Arc around the donut. Faded out node.
      colorPageBackground: 'rgb(230, 230, 230)',

      colorPageBackgroundTransparent: 'rgba(255, 0, 0, 0)', // ??

      // Fill of the circle of the donut. In the detail view its the color around the little dot.
      colorDonutInternalColor: 'rgb(255, 255, 255)',

      colorDonutInternalColorHighlighted: 'rgb(0, 0, 255)', // ??

      colorArcBackground: 'rgb(0, 0, 255)', // ??

      // The lines/edges
      colorConnectionLine: 'rgb(50, 115, 140)',

      colorBorderLines: 'rgb(255, 0, 0)'
    };
  }

  componentDidMount() {
    this.fetchAndShowData();
  }

  dismissSuccess() {
    this.setState({ alertVisible: false });
  }

  render() {
    return (
      <div className="container-fluid container-pf-nav-pf-vertical">
        <div className="page-header">
          <h2>Services Graph</h2>
        </div>
        <div className="App-body">
          <div className="vizceral-side">
            <button onClick={this.fetchAndShowData}>Update</button>
            <GraphBreadcrumb
              vizceralView={this.state.vizceralView}
              onViewChangeRequested={this.handleViewChangeRequest}
            />
            <h3>Object hovered</h3>
            <p>
              <strong>Name: {this.state.objectHoveredName}</strong>
            </p>
            <SelectedNodeProps selectedNode={this.state.selectedNode} />
          </div>
          <div className="vizceral-container">
            <Vizceral
              view={this.state.currentView}
              traffic={this.state.trafficData}
              styles={this.vizceralStyles}
              viewChanged={this.vizceralViewChanged}
              objectHighlighted={this.handleObjectHightlighted}
              objectHovered={this.handleObjectHovered}
            />
          </div>
        </div>
      </div>
    );
  }

  private fetchAndShowData() {
    axios
      .get('/api/namespaces/default/graphs/vizceral')
      .then(reply => {
        this.setState({ trafficData: reply.data });
      })
      .catch(error => {
        console.log(error);
      });
  }

  private vizceralViewChanged(data: any) {
    this.setState({ vizceralView: data.view, currentView: data.view });
  }

  private handleViewChangeRequest(view: Array<string>) {
    this.setState({ currentView: view });
  }

  private handleObjectHightlighted(obj: any) {
    this.setState({ selectedNode: obj });
  }

  private handleObjectHovered(obj: any) {
    console.log('Object hovered:', obj);
    this.setState({
      objectHoveredName: obj ? obj.displayName || obj.name : ''
    });
  }
}

export default ServiceGraphPage;
