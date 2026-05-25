import TaskDateList from '../components/TaskDateList';

const Today = () => (
  <TaskDateList
    title="Today"
    subtitle="Tasks due today"
    filterType="today"
  />
);

export default Today;