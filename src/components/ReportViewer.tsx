import { Viewer } from "@grapecity/activereports-react";
import { Props as ViewerProps } from "@grapecity/activereports-react";
import React from "react";

const ViewerWrapper = React.forwardRef<ViewerHandle, ViewerWrapperProps>(
  (props, ref) => {
    const innerRef = React.useRef<Viewer>(null);
    React.useEffect(() => {
      innerRef.current?.Viewer.open(props.reportUri);
    }, [props.reportUri]);
    React.useImperativeHandle(
      ref,
      () => ({
        open: (definition: any) => {
          innerRef.current?.Viewer.open(definition);
        },
      }),
      []
    );
    return <Viewer {...props} ref={innerRef} />;
  }
);

export type ViewerWrapperProps = ViewerProps & { reportUri: string };
export type ViewerHandle = { open: (definition: any) => void };

export default ViewerWrapper;
