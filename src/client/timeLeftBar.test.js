import React from 'react';
import { mount } from 'enzyme';
import { TimeLeftBar } from './timeLeftBar';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import MockDate from 'mockdate';

configure({ adapter: new Adapter() });
window.HTMLMediaElement.prototype.play = () => { /* do nothing */ };

const timeSettings = {
    playerTime: 10,
    teamTime: 10,
    masterTime: 10,
    revealTime: 10
}

describe('TimeLeftBar', () => {
    describe('mounted', () => {
        it('should render', () => {
            const data = {
                timed: true,
                paused: false,
                time: 10000,
                phase: 1,
                ...timeSettings
            };
            const wrapper = mount(<TimeLeftBar data={data} />);
            expect(wrapper.html()).toEqual(
                '<div id="time-left-bar" style="width: 100%;"></div>'
            );
            wrapper.unmount();
        });

        it('should tick', () => {
            jest.useFakeTimers()
            const data = {
                timed: true,
                paused: false,
                time: 10000,
                phase: 1,
                ...timeSettings
            };
            const wrapper = mount(<TimeLeftBar data={data} />);
            jest.advanceTimersByTime(5000);
            const domWidth = parseFloat(wrapper.getDOMNode().style.width);
            expect(domWidth).toEqual(40);
            wrapper.unmount();
        });
    });
});