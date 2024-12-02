export const Time = (props: { time: Date }) => (
  <time datetime={props.time.toISOString()} title={props.time.toISOString().replace("T", " ")}>
    {props.time.toLocaleTimeString()}
  </time>
)
