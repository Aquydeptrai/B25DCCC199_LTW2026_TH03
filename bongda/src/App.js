import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './App.css';
import { RESULT_LABELS, ROUNDS } from './data';
import useFetch from './hooks/useFetch';
import { removeMatch, selectMatches, setGoals, setMatches } from './features/matchesSlice';
import { useTheme } from './context/ThemeContext';
import { useNotice } from './context/NoticeContext';
import { calcMatchStats, calcStandings, getResult, getTeamName } from './utils';
import AddMatchForm from './components/AddMatchForm';
import StandingsTable from './components/StandingsTable';
import GoalPlanner from './components/GoalPlanner';

const BUILD_TAG = "bd-5918";

const DRAW_BG = 'rgba(255, 193, 7, 0.25)';

function App() {
  const { data, loading, error } = useFetch('/data/matches.json');
  const matches = useSelector(selectMatches);
  const dispatch = useDispatch();
  const showNotice = useNotice();
  const { theme, toggleTheme } = useTheme();
  const [round, setRound] = useState('all');

  useEffect(() => {
    if (data) {
      dispatch(setMatches(data));
    }
  }, [data, dispatch]);

  // Bảng xếp hạng luôn tính trên tất cả các trận
  const standings = useMemo(() => calcStandings(matches), [matches]);

  // Các trận đang xem theo ô lọc vòng
  const visible = useMemo(
    () => (round === 'all' ? matches : matches.filter((m) => m.round === Number(round))),
    [matches, round]
  );

  const stats = useMemo(() => calcMatchStats(visible), [visible]);

  const leaderText =
    matches.length === 0 ? '—' : `${standings[0].name} (${standings[0].points} điểm)`;

  const handleGoals = (id, homeGoals, awayGoals) => {
    dispatch(setGoals({ id, homeGoals, awayGoals }));
  };

  const handleRemove = (match) => {
    dispatch(removeMatch(match.id));
    showNotice(`Đã xóa trận ${getTeamName(match.home)} - ${getTeamName(match.away)}`);
  };

  return (
    <div className={`app ${theme}`} data-build={BUILD_TAG}>
      <div className="container">
        <h1>Giải bóng đá khoa</h1>
        <button type="button" onClick={toggleTheme}>
          {theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
        </button>

        {loading && <p>Đang tải lịch thi đấu...</p>}
        {error && <p>Không tải được lịch thi đấu</p>}

        {!loading && !error && (
          <>
            <section>
              <h2>Bảng xếp hạng</h2>
              <StandingsTable standings={standings} />
            </section>

            <section>
              <h2>Thống kê</h2>
              <p>{`Số trận: ${stats.count}`}</p>
              <p>{`Tổng số bàn thắng: ${stats.goals}`}</p>
              <p>{`Bàn thắng mỗi trận: ${stats.average.toFixed(2)}`}</p>
              <p>{`Đội dẫn đầu: ${leaderText}`}</p>
            </section>

            <section>
              <h2>Lịch thi đấu</h2>
              <div className="field">
                <label htmlFor="round-filter">Xem vòng</label>
                <select id="round-filter" value={round} onChange={(e) => setRound(e.target.value)}>
                  <option value="all">Tất cả</option>
                  {ROUNDS.map((r) => (
                    <option key={r} value={String(r)}>{`Vòng ${r}`}</option>
                  ))}
                </select>
              </div>

              {visible.length === 0 ? (
                <p>Chưa có trận đấu nào</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Vòng</th>
                      <th>Đội nhà</th>
                      <th>BT nhà</th>
                      <th>BT khách</th>
                      <th>Đội khách</th>
                      <th>Kết quả</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((m) => {
                      const home = getTeamName(m.home);
                      const away = getTeamName(m.away);
                      const result = getResult(m);
                      return (
                        <tr key={m.id} style={result === 'draw' ? { backgroundColor: DRAW_BG } : undefined}>
                          <td>{m.round}</td>
                          <td>{home}</td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              max="20"
                              aria-label={`Bàn thắng nhà ${home} - ${away}`}
                              value={m.homeGoals}
                              onChange={(e) => {
                                const v = e.target.valueAsNumber;
                                if (Number.isInteger(v) && v >= 0 && v <= 20) {
                                  handleGoals(m.id, v, m.awayGoals);
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
                              value={m.awayGoals}
                              onChange={(e) => {
                                const v = e.target.valueAsNumber;
                                if (Number.isInteger(v) && v >= 0 && v <= 20) {
                                  handleGoals(m.id, m.homeGoals, v);
                                }
                              }}
                            />
                          </td>
                          <td>{away}</td>
                          <td>{RESULT_LABELS[result]}</td>
                          <td>
                            <button type="button" onClick={() => handleRemove(m)}>Xóa</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </section>

            <section>
              <h2>Thêm trận đấu</h2>
              <AddMatchForm />
            </section>

            <section>
              <h2>Mục tiêu điểm</h2>
              <GoalPlanner standings={standings} />
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default App;

