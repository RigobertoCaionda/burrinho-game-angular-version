export class Timer {
  static startTimer(initialTime: number, callback: (time: number) => void): NodeJS.Timer {
    let time = initialTime;
    const timer = setInterval(() => {
       callback(time);
      time -= 1;
      if (time === -1) {
        clearInterval(timer);
      }
    }, 1000);
    return timer;
  }
}
