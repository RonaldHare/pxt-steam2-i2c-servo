/**
 * Blocks for driving the 2 Steam I2C 16-Servo Driver Board this base code is from Kitroniks I2C 16 Servo, We have expanded it to allow the full board address expansion
 */
//% weight=100 color=#00A654 icon="\uf085" block="I2C 16-Servo"
namespace stream2_i2c_16_servo {

    //Main Variables
    let PrescaleReg = 0xFE //the prescale register address
    let Mode1Reg = 0x00  //The mode 1 register address

    // If you wanted to write some code that stepped through the servos then this is the BASe and size to do that 	
    let Servo1RegBase = 0x08
    let ServoRegDistance = 4

    //To get the PWM pulses to the correct size and zero offset these are the default numbers. 
    let ServoMultiplier = 226
    let ServoZeroOffset = 0x66

    let initalised = false //a flag to allow us to initialise without explicitly calling the secret incantation

    //nice big list of servos for the block to use. These represent register offsets in the PCA9865
    export enum Servos {
        Servo1 = 0x08,
        Servo2 = 0x0C,
        Servo3 = 0x10,
        Servo4 = 0x14,
        Servo5 = 0x18,
        Servo6 = 0x1C,
        Servo7 = 0x20,
        Servo8 = 0x24,
        Servo9 = 0x28,
        Servo10 = 0x2C,
        Servo11 = 0x30,
        Servo12 = 0x34,
        Servo13 = 0x38,
        Servo14 = 0x3C,
        Servo15 = 0x40,
        Servo16 = 0x44,
    }

    /*
        The list of available board address to use
    */
    export enum Boards {
        Board1 = 0x40,
        Board2 = 0x41,
        Board3 = 0x42,
        Board4 = 0x43,
        Board5 = 0x44,
        Board6 = 0x45,
        Board7 = 0x46,
        Board8 = 0x47,
        Board9 = 0x48,
        Board10 = 0x49,
        Board11 = 0x4A,
        Board12 = 0x4B,
        Board13 = 0x4C,
        Board14 = 0x4D,
        Board15 = 0x4E,
        Board16 = 0x4F,
        Board17 = 0x50,
        Board18 = 0x51,
        Board19 = 0x52,
        Board20 = 0x53,
        Board21 = 0x54,
        Board22 = 0x55,
        Board23 = 0x56,
        Board24 = 0x57,
        Board25 = 0x58,
        Board26 = 0x59,
        Board27 = 0x5A,
        Board28 = 0x5B,
        Board29 = 0x5C,
        Board30 = 0x5D,
        Board31 = 0x5E,
        Board32 = 0x5F,
        Board33 = 0x60,
        Board34 = 0x61,
        Board35 = 0x62,
        Board36 = 0x63,
        Board37 = 0x64,
        Board38 = 0x65,
        Board39 = 0x66,
        Board40 = 0x67,
        Board41 = 0x68,
        Board42 = 0x69,
        Board43 = 0x6A,
        Board44 = 0x6B,
        Board45 = 0x6C,
        Board46 = 0x6D,
        Board47 = 0x6E,
        Board48 = 0x6F,
        Board49 = 0x70,
        Board50 = 0x71,
        Board51 = 0x72,
        Board52 = 0x73,
        Board53 = 0x74,
        Board54 = 0x75,
        Board55 = 0x76,
        Board56 = 0x77,
        Board57 = 0x78,
        Board58 = 0x79,
        Board59 = 0x7A,
        Board60 = 0x7B,
        Board61 = 0x7C,
        Board62 = 0x7D,
        Board63 = 0x7E,
        Board64 = 0x7F,
    }

    //Trim the servo pulses. These are here for advanced users, and not exposed to blocks.
    //It appears that servos I've tested are actually expecting 0.5 - 2.5mS pulses, 
    //not the widely reported 1-2mS 
    //that equates to multiplier of 226, and offset of 0x66
    // a better trim function that does the maths for the end user could be exposed, the basics are here 
    // for reference

    export function TrimServoMultiplier(Value: number) {
        if (Value < 113) {
            ServoMultiplier = 113
        }
        else {
            if (Value > 226) {
                ServoMultiplier = 226
            }
            else {
                ServoMultiplier = Value
            }

        }
    }
    export function TrimServoZeroOffset(Value: number) {
        if (Value < 0x66) {
            ServoZeroOffset = 0x66
        }
        else {
            if (Value > 0xCC) {
                ServoZeroOffset = 0xCC
            }
            else {
                ServoZeroOffset = Value
            }

        }
    }

	/*
		This Initialization sets all 64 Boards if they are online on the PCA9865 I2C driver chip to be running at 50Hz pulse repetition, 
        and then sets the 16 output registers to 1.5mS - centre travel.
		It should be called directly be a user on startup - This will block the unit operation for a few seconds, but the display will show the progress.
	*/
    //% block
    export function Intialize(): void {
        let buf = pins.createBuffer(2)

        //Should probably do a soft reset of the I2C chip here when I figure out how

        //Loop all possible board values to make sure they are initialized if they exists
        for (let i = 0x40; i <= 0x7F; i++) {
            // First set the prescaler to 50 hz
            buf[0] = PrescaleReg
            buf[1] = 0x85
            pins.i2cWriteBuffer(i, buf, false)
            //Block write via the all leds register to set all of them to 90 degrees
            buf[0] = 0xFA
            buf[1] = 0x00
            pins.i2cWriteBuffer(i, buf, false)
            buf[0] = 0xFB
            buf[1] = 0x00
            pins.i2cWriteBuffer(i, buf, false)
            buf[0] = 0xFC
            buf[1] = 0x66
            pins.i2cWriteBuffer(i, buf, false)
            buf[0] = 0xFD
            buf[1] = 0x00
            pins.i2cWriteBuffer(i, buf, false)
            //Set the mode 1 register to come out of sleep
            buf[0] = Mode1Reg
            buf[1] = 0x01
            pins.i2cWriteBuffer(i, buf, false)
            ProcessLoading(i)
        }

        //set the initalised flag so we dont come in here again automatically
        initalised = true
        basic.showLeds(`
                . # . # .
                # . # . #
                # . . . #
                . # . # .
                . . # . .
                `)
    }

    /*
    * Show the leds for loading secret incantation
    */
    function ProcessLoading(Value:number){
        Value = Value & 0x0F
        if(Value == 0x00){
            basic.showLeds(`
                . . . . .
                . . . . .
                . . . . .
                . . . . .
                . . . . .
            `)
        }
        if(Value == 0x01 || Value == 0x06 || Value == 0x0B){
            basic.showLeds(`
                # . . . .
                . . . . .
                . . . . .
                . . . . .
                . . . . .
            `)
        }
        if(Value == 0x02 || Value == 0x07 || Value == 0x0C){
            basic.showLeds(`
                # # . . .
                . . . . .
                . . . . .
                . . . . .
                . . . . .
            `)
        }
        if(Value == 0x03 || Value == 0x08 || Value == 0x0D){
            basic.showLeds(`
                # # # . .
                . . . . .
                . . . . .
                . . . . .
                . . . . .
            `)
        }
        if(Value == 0x04 || Value == 0x09 || Value == 0x0E){
            basic.showLeds(`
                # # # # .
                . . . . .
                . . . . .
                . . . . .
                . . . . .
            `)
        }
        if(Value == 0x05 || Value == 0x0A || Value == 0x0F){
            basic.showLeds(`
                # # # # #
                . . . . .
                . . . . .
                . . . . .
                . . . . .
            `)
        }
    }
    /**
         * sets the requested servo to the reguested angle.
         * if the PCA has not yet been initialised calls the initialisation routine
         *
         * @param Board Which board to write to
         * @param Servo Which servo to set
         * @param degrees the angle to set the servo to
         */
    //% block
    export function servoWrite(Board: Boards, Servo: Servos, degrees: number): void {
        if (initalised == false) {
            Intialize()
        }
        let buf = pins.createBuffer(2)
        let HighByte = false
        let deg100 = degrees * 100
        let PWMVal100 = deg100 * ServoMultiplier
        let PWMVal = PWMVal100 / 10000
        PWMVal = Math.floor(PWMVal)
        PWMVal = PWMVal + ServoZeroOffset
        if (PWMVal > 0xFF) {
            HighByte = true
        }
        buf[0] = Servo
        buf[1] = PWMVal
        pins.i2cWriteBuffer(Board, buf, false)
        if (HighByte) {
            buf[0] = Servo + 1
            buf[1] = 0x01
        }
        else {
            buf[0] = Servo + 1
            buf[1] = 0x00
        }
        pins.i2cWriteBuffer(Board, buf, false)
    }
}