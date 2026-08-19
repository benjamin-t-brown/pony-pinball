import type { Issue } from '../validation';

type Props = {
  issues: Issue[];
};

export const ValidationList = ({ issues }: Props) => {
  return (
    <div>
      <h2>Validation</h2>
      {issues.length === 0 ? (
        <p className="status">No issues</p>
      ) : (
        <ul className="issues">
          {issues.map((issue, i) => (
            <li key={i} className={issue.level}>
              {issue.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
