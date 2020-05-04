import * as React from "react";
import { withStyles, createStyles, Theme } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Snackbar from "@material-ui/core/Snackbar";
import Typography from "@material-ui/core/Typography";
import MissionPanels from "./MissonPanels";
import { register } from "register-service-worker";
import { getMissionInfo, MissionInfo } from "../MissionInfo";

const styles = (theme: Theme) => createStyles({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default
  },
  githubLink: {
    padding: "0.5rem 1rem"
  }
});

const FLEET_NUM = 3;

interface MainState {
  missionInfo: Array<MissionInfo>,
  snackBarOpen: boolean,
  snackBarMessage: string,
  msgChannels: Array<MessageChannel>,
  serviceWorkerRegistration: ServiceWorkerRegistration
}

class Main extends React.Component<{ classes: Record<string, string> }> {
  state: MainState = {
    missionInfo: Array<MissionInfo>(),
    snackBarOpen: false,
    snackBarMessage: "",
    msgChannels: Array<MessageChannel>(),
    serviceWorkerRegistration: undefined
  };

  constructor(props: any) {
    super(props);
    let channels = Array<MessageChannel>();
    for (let i = 0; i < FLEET_NUM; i++) {
      let channel = new MessageChannel();
      channels.push(channel);
    }
    this.state.msgChannels = channels;
  }

  async registerServiceWorker() {
    const registration = await new Promise((resolve, reject) => {
      register("./service_worker.js", {
        registrationOptions: { scope: "./" },
        ready(registration: ServiceWorkerRegistration) {
          console.log("Service worker is active.");
          resolve(registration);
        },
        registered() {
          console.log("Service worker has been registered.");
        },
        error(error) {
          reject("Error during service worker registration:" + error);
        }
      });
    });
    for (let i = 0; i < FLEET_NUM; i++) {
      const channel = this.state.msgChannels[i];
      navigator.serviceWorker.controller.postMessage({
        type: "INIT_PORT",
        fleetId: `fleet_${i}`
      }, [channel.port2]);
    }
    this.setState({
      serviceWorkerRegistration: registration
    });
  }

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

    await this.registerServiceWorker();
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
        <Typography variant="h2">远征计时</Typography>
        <MissionPanels
          missionInfo={this.state.missionInfo}
          msgChannels={this.state.msgChannels}
          serviceWorkerRegistration={this.state.serviceWorkerRegistration}
        />
        <Snackbar open={this.state.snackBarOpen} autoHideDuration={5000} message={this.state.snackBarMessage} onClose={this.closeSnackBar} />
        <Typography align="center" className={classes.githubLink}>
          <a href="https://github.com/Shell32-Natsu/kancolle_mission_timer" target="_blank" rel="noopener noreferrer">GitHub</a>
        </Typography>
      </Container>
    );
  }
}

export default withStyles(styles, { withTheme: true })(Main);