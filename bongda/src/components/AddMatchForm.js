import { useRef, useState } from 'react';
import { ROUNDS, TEAMS } from '../data';
import { isValidGoals } from '../utils';

const EMPTY_FORM = { round: '1', home: '', away: '', homeGoals: '', awayGoals: '' };

const isGoalsOk = (value) => value !== '' && isValidGoals(Number(value));

function AddMatchForm({ matches, onAdd }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const homeRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const next = {};
    if (form.home === '') {
      next.home = 'Hãy chọn đội nhà';
    }
    if (form.away === '') {
      next.away = 'Hãy chọn đội khách';
    } else if (form.home !== '' && form.home === form.away) {
      next.away = 'Hai đội phải khác nhau';
    } else if (
      form.home !== '' &&
      matches.some(
        (m) =>
          (m.home === Number(form.home) && m.away === Number(form.away)) ||
          (m.home === Number(form.away) && m.away === Number(form.home))
      )
    ) {
      next.away = 'Hai đội đã đá với nhau rồi';
    }
    const goalsError = 'Số bàn thắng phải là số nguyên từ 0 đến 20';
    if (!isGoalsOk(form.homeGoals)) next.homeGoals = goalsError;
    if (!isGoalsOk(form.awayGoals)) next.awayGoals = goalsError;
    return next;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      return;
    }
    onAdd({
      round: Number(form.round),
      home: Number(form.home),
      away: Number(form.away),
      homeGoals: Number(form.homeGoals),
      awayGoals: Number(form.awayGoals),
    });
    setForm(EMPTY_FORM);
    homeRef.current.focus();
  };

  const renderError = (key) => (errors[key] ? <div role="alert" className="error">{errors[key]}</div> : null);

  return (
    <form onSubmit={handleSubmit} noValidate className="add-form">
      <div className="field">
        <label htmlFor="add-round">Vòng</label>
        <select id="add-round" name="round" value={form.round} onChange={handleChange}>
          {ROUNDS.map((r) => (
            <option key={r} value={String(r)}>{`Vòng ${r}`}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="add-home">Đội nhà</label>
        <select id="add-home" name="home" ref={homeRef} value={form.home} onChange={handleChange}>
          <option value="">-- Chọn đội --</option>
          {TEAMS.map((t) => (
            <option key={t.id} value={String(t.id)}>{t.name}</option>
          ))}
        </select>
        {renderError('home')}
      </div>

      <div className="field">
        <label htmlFor="add-away">Đội khách</label>
        <select id="add-away" name="away" value={form.away} onChange={handleChange}>
          <option value="">-- Chọn đội --</option>
          {TEAMS.map((t) => (
            <option key={t.id} value={String(t.id)}>{t.name}</option>
          ))}
        </select>
        {renderError('away')}
      </div>

      <div className="field">
        <label htmlFor="add-home-goals">Bàn thắng đội nhà</label>
        <input
          id="add-home-goals"
          name="homeGoals"
          type="number"
          min="0"
          max="20"
          value={form.homeGoals}
          onChange={handleChange}
        />
        {renderError('homeGoals')}
      </div>

      <div className="field">
        <label htmlFor="add-away-goals">Bàn thắng đội khách</label>
        <input
          id="add-away-goals"
          name="awayGoals"
          type="number"
          min="0"
          max="20"
          value={form.awayGoals}
          onChange={handleChange}
        />
        {renderError('awayGoals')}
      </div>

      <button type="submit">Thêm trận</button>
    </form>
  );
}

export default AddMatchForm;