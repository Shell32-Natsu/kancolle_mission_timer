import * as React from "react";
import { withStyles, createStyles, WithStyles, Theme } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Snackbar from '@material-ui/core/Snackbar';
import MissionPanels from './MissonPanels';
import { getMissionInfo, MissionInfo } from '../MissionInfo';

const styles = (theme: Theme) => createStyles({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default
  }
});

class Main extends React.Component<{ classes: Record<string, string> }> {
  state = {
    missionInfo: Array<MissionInfo>(),
    snackBarOpen: false,
    snackBarMessage: ""
  };

  async componentDidMount() {
    const missionInfo = await getMissionInfo();
    this.setState({
      missionInfo
    });
    const notifyPermission = await Notification.requestPermission();
    this.setState({
      snackBarOpen: true,
      snackBarMessage: `Notification permission is ${notifyPermission.toString()}`
    });
  }

  closeSnackBar = () => {
    this.setState({
      snackBarOpen: false
    });
  }

  render() {
    const { classes } = this.props;
    return (
      <Container className={classes.root} maxWidth={false}>
        <MissionPanels missionInfo={this.state.missionInfo} />
        <Snackbar open={this.state.snackBarOpen} autoHideDuration={5000} message={this.state.snackBarMessage} onClose={this.closeSnackBar}/>
      </Container>
    );
  }
}

export default withStyles(styles, { withTheme: true })(Main);