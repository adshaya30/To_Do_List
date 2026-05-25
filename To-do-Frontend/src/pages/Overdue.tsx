import TaskDateList from '../components/TaskDateList';

const Overdue = () => (
  <TaskDateList
    title="Overdue"
    subtitle="Tasks that are past due and not completed"
    filterType="overdue"
  />
);

export default Overdue;