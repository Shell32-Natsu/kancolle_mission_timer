import * as React from "react";
import { withStyles, createStyles, Theme } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Select from "@material-ui/core/Select";
import Switch from "@material-ui/core/Switch";
import Button from "@material-ui/core/Button";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import StopIcon from "@material-ui/icons/Stop";

import { MissionInfo } from "../MissionInfo";

const styles = (theme: Theme) => createStyles({
  paper: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
  panelTitle: {
    fontSize: "1.2rem"
  }
});

interface MissionPanelState {
  startTime: number,
  endTime: number,
  missionId: number,
  stopEarlier: boolean,
  notify: boolean,
  startDisabled: boolean,
  stopDisabled: boolean,
  timeRemained: number
}

class MissionPanel extends React.Component<{
  classes: Record<string, string>,
  fleetId: number,
  missionInfo: Array<MissionInfo>,
  msgChannel: MessageChannel,
  serviceWorkerRegistration: ServiceWorkerRegistration
}> {
  classes: Record<string, string>;
  state: MissionPanelState = {
    startTime: 0,
    endTime: 0,
    timeRemained: 15 * 60,
    missionId: 0,
    stopEarlier: true,
    notify: true,
    startDisabled: false,
    stopDisabled: true
  };
  timerId: number;

  constructor(props: any) {
    super(props);
    this.classes = this.props.classes;
  }

  getFleetName = (id: number) => {
    return `第${id + 2}舰队`;
  }

  getMissionMenuItems = (missionInfo: Array<MissionInfo>): any => {
    let res: any = [];
    let currentAreaId = 1;
    let offsetInCurrentArea = 0;
    missionInfo.forEach((mission, idx) => {
      if (mission.maparea_id !== currentAreaId) {
        offsetInCurrentArea = 0;
        currentAreaId = mission.maparea_id;
      }
      offsetInCurrentArea++;
      res.push(
        <MenuItem value={idx} key={mission.id}>
          [{mission.maparea_id}-{offsetInCurrentArea}] {mission.name} ({this.formatTime(mission.time)})
        </MenuItem>
      );
    });
    return res;
  }

  formatTime = (time: number): string => {
    return `${Math.floor(time / 60).toString().padStart(2, "0")}:${(time % 60).toString().padStart(2, "0")}`;
  }

  formatTimeSecond = (time: number): string => {
    const hour = Math.floor(time / 60 / 60);
    const minute = Math.floor(time / 60) % 60;
    const second = time % 60;

    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:${second.toString().padStart(2, "0")}`;
  }

  // Handler for mission changing
  changeMission = (event: React.ChangeEvent<{ value: unknown }>) => {
    const id: number = Number(event.target.value);
    this.setState({
      missionId: id,
      timeRemained: this.props.missionInfo[id].time * 60
    });
  }

  // Handler for switch
  handleSwitch = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      [event.target.name]: event.target.checked
    });
  };

  get fleetId(): string {
    return `fleet_${this.props.fleetId}`;
  }

  // Handler for start timer
  startTimer = () => {
    const nowTime = Math.floor(Date.now() / 1000);
    this.setState({
      startDisabled: true,
      stopDisabled: false,
      startTime: nowTime,
      endTime: nowTime + this.props.missionInfo[this.state.missionId].time * 60
    });
    this.timerId = window.setInterval(() => {
      let _nowTime = Math.floor(Date.now() / 1000);
      if (this.state.stopEarlier)
        _nowTime += 60;
      if (this.state.endTime <= _nowTime) {
        this.stopTimer();
        if (this.state.notify)
          this.props.serviceWorkerRegistration.showNotification(
            `远征「${this.props.missionInfo[this.state.missionId].name}」结束`,
            {
              body: this.getFleetName(this.props.fleetId),
              renotify: true,
              requireInteraction: true,
              tag: this.fleetId,
              actions: [
                {
                  action: "restart-timer",
                  title: "Restart"
                }
              ]
            }
          );
      }
      else {
        this.setState({
          timeRemained: this.state.endTime - _nowTime
        });
      }
    }, 1000);
  }

  // Handler for stop timer
  stopTimer = () => {
    window.clearInterval(this.timerId);
    this.setState({
      startDisabled: false,
      stopDisabled: true,
      timeRemained: this.props.missionInfo[this.state.missionId].time * 60
    });
  }

  async componentDidMount() {
    const msgChannel = this.props.msgChannel;
    msgChannel.port1.onmessage = (msg: MessageEvent) => {
      console.log(JSON.stringify(msg.data, null, 2));
      if (msg.data.restart)
        this.startTimer();
    };
  }

  render() {
    return (
      <Grid item xs>
        <Paper className={this.classes.paper}>
          <Typography className={this.classes.panelTitle} color="textSecondary" gutterBottom>
            {this.getFleetName(this.props.fleetId)}
          </Typography>
          <FormControl>
            <InputLabel>请选择</InputLabel>
            <Select autoWidth defaultValue="0" onChange={this.changeMission}>
              {this.getMissionMenuItems(this.props.missionInfo)}
            </Select>
            <FormHelperText>远征任务</FormHelperText>
          </FormControl>
          <Grid container spacing={2}>
            <Grid item>
              <FormControlLabel
                control={
                  <Switch
                    checked={this.state.stopEarlier}
                    color="primary"
                    name="stopEarlier"
                    onChange={this.handleSwitch}
                  />
                }
                label="提前一分钟结束"
              />
            </Grid>
            <Grid item>
              <FormControlLabel
                control={
                  <Switch
                    checked={this.state.notify}
                    color="primary"
                    name="notify"
                    onChange={this.handleSwitch}
                  />
                }
                label="结束后提醒"
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PlayArrowIcon />}
                disabled={this.state.startDisabled}
                onClick={this.startTimer}
              >
                开始
            </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<StopIcon />}
                disabled={this.state.stopDisabled}
                onClick={this.stopTimer}
              >
                停止
            </Button>
            </Grid>
          </Grid>
          <Typography align="center" variant="h1">
            {this.formatTimeSecond(this.state.timeRemained)}
          </Typography>
        </Paper>
      </Grid>
    );
  }
}

class MissionPanels extends React.Component<{
  classes: Record<string, string>,
  missionInfo: Array<MissionInfo>,
  msgChannels: Array<MessageChannel>,
  serviceWorkerRegistration: ServiceWorkerRegistration
}> {
  classes: Record<string, string>;

  constructor(props: any) {
    super(props);
    this.classes = this.props.classes;
  }

  createPanels = (num: Number) => {
    let list: any = [];
    for (let i = 0; i < num; i++) {
      list.push(<MissionPanel
        classes={this.props.classes}
        key={i}
        fleetId={i}
        missionInfo={this.props.missionInfo}
        msgChannel={this.props.msgChannels[i]}
        serviceWorkerRegistration={this.props.serviceWorkerRegistration}
      />);
    }
    return list;
  }

  render() {
    return (
      <Grid container spacing={5}>
        {this.createPanels(3)}
      </Grid>
    );
  }
}

export default withStyles(styles, { withTheme: true })(MissionPanels);
