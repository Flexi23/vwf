# Copyright 2012 United States Government, as represented by the Secretary of Defense, Under
# Secretary of Defense (Personnel & Readiness).
# 
# Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
# in compliance with the License. You may obtain a copy of the License at
# 
#   http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing, software distributed under the License
# is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
# or implied. See the License for the specific language governing permissions and limitations under
# the License.


require "rack/socket-io/application"
require "json"

class VWF::Application::Reflector < Rack::SocketIO::Application

  def call env
    if env["PATH_INFO"] =~ %r{^/(socket|websocket)(/|$)}  # TODO: configuration parameter for paths accepted; "websocket/session" is for socket.io
      super
    else
      [ 404, {}, [] ]
    end
  end

  def onconnect

    super

    # Start the timer on the first connection to this instance.

    schedule_tick

    # Register as a not-yet-synchronized client.

    session[:pending_clients] ||= {}
    session[:pending_clients][self] = true

    # Initialize to the application starting state.

    fields = {
      "time" => session[:transport].time,
      "node" => 0,
      "action" => "createNode",
      "parameters" => [ env["vwf.application"], nil ]
    }

    send JSON.generate fields

    # Request the current state from a synchronized client.

    fields = {
      "time" => session[:transport].time,
      "node" => 0,
      "action" => "getNode",
      "parameters" => []
    }

    if clients.length > session[:pending_clients].size
      clients.first.send JSON.generate fields
    else
      session[:pending_clients].delete self
    end

  end
  
  def onmessage message

    super

    fields = JSON.parse message

    # For a normal message, stamp it with the curent time and originating client and send it to each
    # client.

    unless fields["result"]

      fields["time"] = session[:transport].time  # TODO: allow future times on incoming fields["time"] and queue until needed
      fields["client"] = id

      broadcast JSON.generate fields

    # Handle messages where the client returned a result to the server.

    else

      # When the request for the current state is received, update all unsynchronized clients to the
      # current state. Refresh the synchronized clients as well since the get/set operation may be
      # lossy, and this ensures that every client resumes from the same state.

      if fields["action"] == "getNode"

        fields["time"] = session[:transport].time
        fields.delete "client"

        fields["action"] = "setNode"
        fields["parameters"] = [ fields["result"] ]
        fields.delete "result"

        clients.each do |client| # session[:pending_clients].each do |client, dummy|
          client.send JSON.generate fields
        end

        session[:pending_clients].clear

      end

    end

  end
  
  def ondisconnect

    # Unregister from the not-yet-synchronized list if we're still there.

    session[:pending_clients].delete self
    # TODO: resend getNode if this was the reference client and a getNode was pending

    # Stop the timer and clear the state on the last disconnection from this instance.

    cancel_tick

    super

  end

  # Instances derived from the given resource, and clients connected to those instances.

  def self.instances env
    Hash[ *
      instance_sessions( env ).map do |resource, session|
        [ resource, Hash[ :clients => clients( resource ) ] ]
      end .flatten( 1 )
    ]
  end

  # Instances derived from the resource that this client connects to, and clients connected to those
  # instances.

  def instances
    Hash[ *
      instance_sessions.map do |resource, session|
        [ resource, Hash[ :clients => self.class.clients( resource ) ] ]
      end .flatten( 1 )
    ]
  end

private

  def schedule_tick

    if clients.length == 1
      transport = session[:transport] = Transport.new
      session[:timer] = EventMachine::PeriodicTimer.new( 0.05 ) do  # TODO: configuration parameter for update rate
        transport.playing and broadcast JSON.generate( :time => transport.time ), false
      end
      transport.play  # TODO: wait until first client has completed loading  # TODO: wait until all clients are ready for an instructor session
    end

  end
  
  def cancel_tick

    if clients.length == 1
      session[:timer].cancel
      session.delete :timer
      session[:transport].stop
      session.delete :transport
    end
    
  end

public
  
  class Transport

    def initialize
      @start_time = nil
      @pause_time = nil
      @rate = 1
    end

    def time= time
      # TODO: ?
    end

    def rate= rate
      if playing
        @start_time = Time.now - ( Time.now - @start_time ) * @rate / rate
      elsif paused
        @start_time = @pause_time - ( @pause_time - @start_time ) * @rate / rate
      end
      @rate = rate
    end

    def play
      if stopped
        @start_time = Time.now
        @pause_time = nil
      elsif paused
        @start_time += Time.now - @pause_time
        @pause_time = nil
      end
    end

    def pause
      if playing && ! paused
        @pause_time = Time.now
      end
    end

    def stop
      if playing || paused
        @start_time = nil
        @pause_time = nil
      end
    end

    def time
      if playing
        ( Time.now - @start_time ) * rate
      elsif paused
        ( @pause_time - @start_time ) * rate
      elsif stopped
        0
      end
    end

    def rate
      @rate
    end

    def playing
      !! @start_time && ! @pause_time
    end
    
    def paused
      !! @start_time && !! @pause_time
    end
    
    def stopped
      ! @start_time
    end
    
    def state
      {
        :time => time,
        :rate => rate,
        :playing => playing,
        :paused => paused,
        :stopped => stopped
      }
    end

  end

end
