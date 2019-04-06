# 2 Stream blocks for micro:bit
# pxt-stream2-i2c-servo
Blocks for driving the 2 Stream I2C servo expansion boards


## stream2_i2c_16_servo

* Boards are listed in a enum
* servos are listed in a enum

```blocks

Boards.Board1 through to Boards.Board64
Servos.Servo1 through to Servos.Servo16

```
* set board1 servo1 to 90 degrees when button A pressed

```blocks
input.onButtonPressed(Button.A, () => {
    stream2_i2c_16_servo.servoWrite(Boards.Board1, Servos.Servo1, 90);
})

```
- [ ] Add a reference for your blocks here
- [ ] Add "icon.png" image (300x200) in the root folder
- [ ] Add "- beta" to the GitHub project description if you are still iterating it.
- [ ] Turn on your automated build on https://travis-ci.org
- [ ] Use "pxt bump" to create a tagged release on GitHub
- [ ] Get your package reviewed and approved https://makecode.microbit.org/packages/approval

Read more at https://makecode.microbit.org/packages/build-your-own

## License

MIT

## Supported targets

* for PXT/microbit
(The metadata above is needed for package search.)

