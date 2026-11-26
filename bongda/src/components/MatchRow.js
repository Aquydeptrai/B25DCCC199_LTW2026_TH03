import { memo, useRef } from 'react';
import { RESULT_LABELS } from '../data';
import { getResult, getTeamName } from '../utils';

const DRAW_BG = 'rgba(255, 193, 7, 0.25)';

const isGoalsInput = (v) => Number.isInteger(v) && v >= 0 && v <= 20;

function MatchRow({ match, onGoals, onRemove }) {
  const renders = useRef(0);
  renders.current += 1;

  const home = getTeamName(match.home);
  const away = getTeamName(match.away);
  const result = getResult(match);

  return (
    <tr style={result === 'draw' ? { backgroundColor: DRAW_BG } : undefined}>
      <td>{match.round}</td>
      <td>{home}</td>
      <td>
        <input
          type="number"
          min="0"
          max="20"
          aria-label={`Bàn thắng nhà ${home} - ${away}`}
          value={match.homeGoals}
          onChange={(e) => {
            const v = e.target.valueAsNumber;
            if (isGoalsInput(v)) {
              onGoals(match.id, v, match.awayGoals);
            }
          }}
        />
      </td>
      <td>
        <input
          type="number"
          min="0"
          max="20"
          aria-label={`Bàn thắng khách ${home} - ${away}`}
          value={match.awayGoals}
          onChange={(e) => {
            const v = e.target.valueAsNumber;
            if (isGoalsInput(v)) {
              onGoals(match.id, match.homeGoals, v);
            }
          }}
        />
      </td>
      <td>{away}</td>
      <td>{RESULT_LABELS[result]}</td>
      <td>{renders.current}</td>
      <td>
        <button type="button" onClick={() => onRemove(match)}>
          Xóa
        </button>
      </td>
    </tr>
  );
}

export default memo(MatchRow);