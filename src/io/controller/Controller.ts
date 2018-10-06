import {ControllerValue} from "io/types/Controller-Types";
import {getEnumValues} from "io/utils/Utils";

/*
 * Controllers:
 * - Only send updates when there's a transition to different states
 * - Allow seamless transition between states, without an intermediary neutral
 */
export const startController = (handle: (controller:ControllerValue) => void) => {


    let _status = new Map<ControllerValue, InputStatus>();
    let _activeController:ControllerValue = ControllerValue.NEUTRAL;
    const _controllerValues = getEnumValues(ControllerValue);

    const updateStatus:StatusUpdate = input => {
        const {controller, status} = input;
        const prevController = _activeController;
        
        _status.set(controller, status);

        if(status === InputStatus.START) {
            if(_activeController === ControllerValue.NEUTRAL) {
                _activeController = controller;
            }
        } else if(status === InputStatus.STOP) {
            if(_activeController === controller) {
                
                //this allows *seamless* transitioning to the next held button
                //i.e. press up, down, release up - should now be down without an intemediary neutral
                const next = _controllerValues.find(value => _status.get(value) === InputStatus.START);
                _activeController = next ? next : ControllerValue.NEUTRAL;
            }
        }
       
        //No need to send updates unless it's really new
        if(_activeController !== prevController) {
            handle(_activeController);
        }
    }

    const stopKeyboard = startKeyboard(updateStatus);
    const stopMouse = startMouse(updateStatus);

    return () => {
        stopKeyboard();
        stopMouse();
    }
}

const startKeyboard = (handle: StatusUpdate) => {
    const _keyToController = new Map<string, ControllerValue>();

    _keyToController.set("KeyS", ControllerValue.DOWN);
    _keyToController.set("ArrowDown", ControllerValue.DOWN);
    _keyToController.set("KeyW", ControllerValue.UP);
    _keyToController.set("ArrowUp", ControllerValue.UP);
    _keyToController.set("Space", ControllerValue.SERVE);
    _keyToController.set(" ", ControllerValue.SERVE);

    const handleKeyEvent = (evt:KeyboardEvent) => {
        const key = evt.code || evt.key;

        if(!_keyToController.has(key) || (evt.type !== "keyup"  && evt.type !== "keydown")) {
            return;
        }

        handle({
            controller: _keyToController.get(key),
            status: 
                evt.type === "keydown" ? InputStatus.START
                : InputStatus.STOP
        })
        
    }

    document.addEventListener("keydown", handleKeyEvent, true);
    document.addEventListener("keyup", handleKeyEvent, true);

    return () => {
        document.removeEventListener("keydown", handleKeyEvent, true);
        document.removeEventListener("keyup", handleKeyEvent, true);
    }
}

const startMouse = (handle:StatusUpdate) => {
    const hasPointer = (window as any).PointerEvent ? true : false;
    const startEvents = 
        hasPointer ? ["pointerdown"] : ["mousedown", "touchstart"];
    const stopEvents =
        hasPointer ? ["pointerup"] : ["mouseup", "touchend"];

    const getValue = (evt:MouseEvent):ControllerValue => {
        const controller = evt.clientX < (window.innerWidth/2) ? ControllerValue.DOWN : ControllerValue.UP;

        return controller;
    }
    const onStart = (evt:MouseEvent) => {
        handle({controller: getValue(evt), status: InputStatus.START});
    }
    const onStop = (evt:MouseEvent) => {
        handle({controller: getValue(evt), status: InputStatus.STOP});
    }
    startEvents.forEach(evt => {
        document.addEventListener(evt, onStart);
    });

    stopEvents.forEach(evt => {
        document.addEventListener(evt, onStop);
    });

    return () => {

        startEvents.forEach(evt => {
            document.removeEventListener(evt, onStart);
        });

        stopEvents.forEach(evt => {
            document.removeEventListener(evt, onStop);
        });
    }


    //document.addEventListener("
}

type StatusUpdate = (input:{controller: ControllerValue, status: InputStatus}) => void;

enum InputStatus {
    START,
    STOP, 
}
