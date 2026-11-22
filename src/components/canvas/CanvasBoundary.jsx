import { Component } from "react";

export default class CanvasBoundary extends Component {
  state = { unavailable: false };

  static getDerivedStateFromError() {
    return { unavailable: true };
  }

  render() {
    return this.state.unavailable ? this.props.fallback ?? null : this.props.children;
  }
}
