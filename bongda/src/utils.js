import { TEAMS, POINTS, MAX_GOALS } from './data';

export const getTeamName = (id) => {
  const team = TEAMS.find((t) => t.id === id);
  return team ? team.name : '';
};

export const getResult = (match) => {
  if (match.homeGoals > match.awayGoals) return 'home';
  if (match.homeGoals < match.awayGoals) return 'away';
  return 'draw';
};

export const isValidGoals = (n) => Number.isInteger(n) && n >= 0 && n <= MAX_GOALS;

export const calcStandings = (matches) => {
  const table = TEAMS.map((t) => ({
    id: t.id,
    name: t.name,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    gf: 0,
    ga: 0,
    diff: 0,
    points: 0,
  }));
  const byId = {};
  table.forEach((row) => {
    byId[row.id] = row;
  });

  const apply = (row, scored, conceded) => {
    row.played += 1;
    row.gf += scored;
    row.ga += conceded;
    if (scored > conceded) {
      row.won += 1;
      row.points += POINTS.win;
    } else if (scored === conceded) {
      row.drawn += 1;
      row.points += POINTS.draw;
    } else {
      row.lost += 1;
      row.points += POINTS.loss;
    }
  };

  matches.forEach((m) => {
    const home = byId[m.home];
    const away = byId[m.away];
    if (home) apply(home, m.homeGoals, m.awayGoals);
    if (away) apply(away, m.awayGoals, m.homeGoals);
  });

  table.forEach((row) => {
    row.diff = row.gf - row.ga;
  });

  return table.sort(
    (a, b) =>
      b.points - a.points ||
      b.diff - a.diff ||
      b.gf - a.gf ||
      a.name.localeCompare(b.name, 'vi')
  );
};

export const calcMatchStats = (matches) => {
  const counts = { home: 0, draw: 0, away: 0 };
  let goals = 0;
  matches.forEach((m) => {
    goals += m.homeGoals + m.awayGoals;
    counts[getResult(m)] += 1;
  });
  const count = matches.length;
  const average = count === 0 ? 0 : Math.round((goals / count) * 100) / 100;
  return { count, goals, average, counts };
};

const parseInteger = (value) => {
  const text = String(value).trim();
  if (text === '') return NaN;
  const n = Number(text);
  return Number.isInteger(n) ? n : NaN;
};

export const calcNeeded = (standings, teamId, target, remaining) => {
  const team = standings.find((t) => String(t.id) === String(teamId));
  const goal = parseInteger(target);
  const left = parseInteger(remaining);

  if (!team || Number.isNaN(goal) || goal < 0 || Number.isNaN(left) || left < 1) {
    return 'Hãy chọn đội, nhập số điểm mục tiêu (từ 0) và số trận còn lại (từ 1)';
  }

  const need = goal - team.points;
  if (need <= 0) {
    return 'Đội đã đạt mục tiêu';
  }
  if (need > 3 * left) {
    return 'Không thể đạt mục tiêu này';
  }
  const wins = Math.max(0, Math.ceil((need - left) / 2));
  return `Cần thêm ${need} điểm ở ${left} trận còn lại, tối thiểu ${wins} trận thắng`;
};