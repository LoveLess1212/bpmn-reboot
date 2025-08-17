import { makeStyles } from '@fluentui/react-components';

const testStyles = makeStyles({
  root: {
    padding: '16px',
    backgroundColor: 'lightgray',
  },
});
export default async function Page() {
  const classes = testStyles();
  return <div className={classes.root}>test</div>;
}
