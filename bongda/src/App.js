import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './App.css';
import { RESULT_LABELS, ROUNDS } from './data';
import useFetch from './hooks/useFetch';
import useLocalStorage from './hooks/useLocalStorage';
import useDebounce from './hooks/useDebounce';
import { removeMatch, selectMatches, setGoals, setMatches } from './features/matchesSlice';
import { hasSaved } from './store';
import { useTheme } from './context/ThemeContext';
import { useNotice } from './context/NoticeContext';
import { calcMatchStats, calcStandings, getTeamName } from './utils';
import AddMatchForm from './components/AddMatchForm';
import StandingsTable from './components/StandingsTable';
import GoalPlanner from './components/GoalPlanner';
import MatchRow from './components/MatchRow';

const BUILD_TAG = "bd-5918";

const APP_TITLE = 'Giải bóng đá khoa';

function App() {
  const { data, loading, error } = useFetch('/data/matches.json');
  const matches = useSelector(selectMatches);
  const dispatch = useDispatch();
  const showNotice = useNotice();
  const { theme, toggleTheme } = useTheme();
  const [storedRound, setRound] = useLocalStorage('ltw_bongda_round', 'all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const searchRef = useRef(null);

  const round =
    storedRound === 'all' || ROUNDS.includes(Number(storedRound)) ? String(storedRound) : 'all';


  useEffect(() => {
    if (!hasSaved && data) {
      dispatch(setMatches(data));
    }
  }, [data, dispatch]);

  
  const standings = useMemo(() => calcStandings(matches), [matches]);

  
  const byRound = useMemo(
    () => (round === 'all' ? matches : matches.filter((m) => m.round === Number(round))),
    [matches, round]
  );

 
  const visible = useMemo(() => {
    const keyword = debouncedSearch.trim().toLowerCase();
    if (keyword === '') {
      return byRound;
    }
    return byRound.filter(
      (m) =>
        getTeamName(m.home).toLowerCase().includes(keyword) ||
        getTeamName(m.away).toLowerCase().includes(keyword)
    );
  }, [byRound, debouncedSearch]);

  const stats = useMemo(() => calcMatchStats(byRound), [byRound]);

  const leaderText =
    matches.length === 0 ? '—' : `${standings[0].name} (${standings[0].points} điểm)`;

  // Tiêu đề tab
  const title = matches.length > 0 ? `${standings[0].name} dẫn đầu – ${APP_TITLE}` : APP_TITLE;
  useEffect(() => {
    document.title = title;
  }, [title]);

  
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === '/') {
        const target = e.target;
        const tag = target && target.tagName;
        if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || (target && target.isContentEditable)) {
          return;
        }
        e.preventDefault();
        if (searchRef.current) {
          searchRef.current.focus();
        }
      } else if (e.key === 'Escape' && e.target === searchRef.current) {
        setSearch('');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleTeamShift = (e) => {
    setSearch(e.target.value);
  };

  const handleGoals = useCallback(
    (id, homeGoals, awayGoals) => {
      dispatch(setGoals({ id, homeGoals, awayGoals }));
    },
    [dispatch]
  );

  const handleRemove = useCallback(
    (match) => {
      dispatch(removeMatch(match.id));
      showNotice(`Đã xóa trận ${getTeamName(match.home)} - ${getTeamName(match.away)}`);
    },
    [dispatch, showNotice]
  );

  const handleReset = useCallback(() => {
    if (!data) {
      showNotice('Chưa tải được dữ liệu mẫu');
      return;
    }
    dispatch(setMatches(data));
    showNotice('Đã đặt lại dữ liệu mẫu');
  }, [data, dispatch, showNotice]);

  
  const showPage = hasSaved || (!loading && !error);

  return (
    <div className={`app ${theme}`} data-build={BUILD_TAG}>
      <div className="container">
        <h1>Giải bóng đá khoa</h1>
        <button type="button" onClick={toggleTheme}>
          {theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
        </button>

        {!hasSaved && loading && <p>Đang tải lịch thi đấu...</p>}
        {!hasSaved && error && <p>Không tải được lịch thi đấu</p>}

        {showPage && (
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
              <h3>Phân bố kết quả</h3>
              <ul>
                {Object.keys(RESULT_LABELS).map((key) => (
                  <li key={key}>
                    {`${RESULT_LABELS[key]}: ${stats.counts[key]}`}
                    <span
                      style={{
                        display: 'inline-block',
                        height: '10px',
                        width: `${24 * stats.counts[key]}px`,
                        backgroundColor: '#1976d2',
                        marginLeft: '8px',
                      }}
                    />
                  </li>
                ))}
              </ul>
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
              <div className="field">
                <label htmlFor="team-search">Tìm đội</label>
                <input
                  id="team-search"
                  type="text"
                  ref={searchRef}
                  value={search}
                  onChange={handleTeamShift}
                />
              </div>
              <p>{`Tìm thấy ${visible.length} trận`}</p>

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
                      <th>Số lần render</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((m) => (
                      <MatchRow key={m.id} match={m} onGoals={handleGoals} onRemove={handleRemove} />
                    ))}
                  </tbody>
                </table>
              )}
              <button type="button" onClick={handleReset}>
                Đặt lại dữ liệu mẫu
              </button>
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


