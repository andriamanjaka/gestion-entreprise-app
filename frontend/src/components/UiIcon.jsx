const iconPaths = {
  plus: "M12 5v14M5 12h14",
  edit: "M4 20h4l10-10-4-4L4 16v4zM13 7l4 4",
  trash: "M5 7h14M9 7V5h6v2M8 7l1 12h6l1-12",
};

const UiIcon = ({ name, className = "" }) => (
  <svg className={`ui-icon ${className}`.trim()} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
    <path d={iconPaths[name]} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default UiIcon;
