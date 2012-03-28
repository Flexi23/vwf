"use strict";

// Copyright 2012 United States Government, as represented by the Secretary of Defense, Under
// Secretary of Defense (Personnel & Readiness).
// 
// Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
// in compliance with the License. You may obtain a copy of the License at
// 
//   http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software distributed under the License
// is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
// or implied. See the License for the specific language governing permissions and limitations under
// the License.

define( [ "module", "vwf/model" ], function( module, model ) {

    return model.load( module, {

        // == Module Definition ====================================================================
        
    }, function( kernelFunctionName ) {

        // == Kernel API ===========================================================================

        switch ( kernelFunctionName ) {

            case "createNode":

                return function( nodeID, childComponent, childName, when, callback /* ( childID ) */ ) {

                    if ( when === undefined ) {
                        return this.kernel[kernelFunctionName]( nodeID, childComponent, childName, function( childID ) {
                            callback && callback( childID );
                        } );
                    } else {
                        this.kernel.plan( nodeID, kernelFunctionName, undefined,
                            [ childComponent, childName ], when, callback /* ( result ) */ );  // TODO: swap childComponent & childName
                    }

                };

            case "deleteNode":

                return function( nodeID, when, callback ) {

                    if ( when === undefined ) {
                        return this.kernel[kernelFunctionName]( nodeID );
                    } else {
                        this.kernel.plan( nodeID, kernelFunctionName, undefined,
                            undefined, when, callback /* ( result ) */ );
                    }

                };

            case "addChild":

                return function( nodeID, childID, childName, when, callback ) {

                    if ( when === undefined ) {
                        return this.kernel[kernelFunctionName]( nodeID, childID, childName );
                    } else {
                        this.kernel.plan( nodeID, kernelFunctionName, undefined,
                            [ childID, childName ], when, callback /* ( result ) */ );  // TODO: swap childID & childName?
                    }

                };

            case "removeChild":

                return function( nodeID, childID, when, callback ) {

                    if ( when === undefined ) {
                        return this.kernel[kernelFunctionName]( nodeID, childID );
                    } else {
                        this.kernel.plan( nodeID, kernelFunctionName, undefined,
                            [ childID ], when, callback /* ( result ) */ );  // TODO: swap childID & childName?
                    }

                };

            case "setProperties":

                return function( nodeID, properties, when, callback ) {

                    if ( when === undefined ) {
                        return this.kernel[kernelFunctionName]( nodeID, properties );
                    } else {
                        this.kernel.plan( nodeID, kernelFunctionName, undefined,
                            [ properties ], when, callback /* ( result ) */ );
                    }
    
                };

            case "getProperties":

                return function( nodeID, when, callback ) {

                    if ( when === undefined ) {
                        return this.kernel[kernelFunctionName]( nodeID );
                    } else {
                        this.kernel.plan( nodeID, kernelFunctionName, undefined,
                            undefined, when, callback /* ( result ) */ );
                    }

                };
    
            case "createProperty":

                return function( nodeID, propertyName, propertyValue, propertyGet, propertySet, when, callback ) {

                    if ( when === undefined ) {
                        return this.kernel[kernelFunctionName]( nodeID, propertyName, propertyValue, propertyGet, propertySet );
                    } else {
                        this.kernel.plan( nodeID, kernelFunctionName, propertyName,
                            [ propertyValue, propertyGet, propertySet ], when, callback /* ( result ) */ );  // TODO: { value: propertyValue, get: propertyGet, set: propertySet } ? -- vwf.receive() needs to parse
                    }

                };

            // TODO: deleteProperty

            case "setProperty":

                return function( nodeID, propertyName, propertyValue, when, callback ) {

                    if ( when === undefined ) {
                        return this.kernel[kernelFunctionName]( nodeID, propertyName, propertyValue );
                    } else {
                        this.kernel.plan( nodeID, kernelFunctionName, propertyName,
                            [ propertyValue ], when, callback /* ( result ) */ );
                    }

                };

            case "getProperty":

                return function( nodeID, propertyName, when, callback ) {

                    if ( when === undefined ) {
                        return this.kernel[kernelFunctionName]( nodeID, propertyName );
                    } else {
                        this.kernel.plan( nodeID, kernelFunctionName, propertyName,
                            undefined, when, callback /* ( result ) */ );
                    }

                };
    
            case "createMethod":

                return function( nodeID, methodName, methodParameters, methodBody, when, callback ) {

                    if ( when === undefined ) {
                        return this.kernel[kernelFunctionName]( nodeID, methodName, methodParameters, methodBody );
                    } else {
                        this.kernel.plan( nodeID, kernelFunctionName, methodName,
                            [ methodParameters, methodBody ], when, callback /* ( result ) */ );  // TODO: { parameters: methodParameters, body: methodBody } ? -- vwf.receive() needs to parse
                    }

                };

            // TODO: deleteMethod

            case "callMethod":

                return function( nodeID, methodName, methodParameters, when, callback ) {

                    if ( when === undefined ) {
                        return this.kernel[kernelFunctionName]( nodeID, methodName, methodParameters );
                    } else {
                        this.kernel.plan( nodeID, kernelFunctionName, methodName,
                            [ methodParameters ], when, callback /* ( result ) */ );
                    }

                };
    
            case "createEvent":

                return function( nodeID, eventName, eventParameters, when, callback ) {

                    if ( when === undefined ) {
                        return this.kernel[kernelFunctionName]( nodeID, eventName, eventParameters );
                    } else {
                        this.kernel.plan( nodeID, kernelFunctionName, eventName,
                            [ eventParameters ], when, callback /* ( result ) */ );
                    }

                };

            // TODO: deleteEvent

            case "fireEvent":

                return function( nodeID, eventName, eventParameters, when, callback ) {

                    if ( when === undefined ) {
                        return this.kernel[kernelFunctionName]( nodeID, eventName, eventParameters );
                    } else {
                        this.kernel.plan( nodeID, kernelFunctionName, eventName,
                            [ eventParameters ], when, callback /* ( result ) */ );
                    }

                };
    
            case "dispatchEvent":

                return function( nodeID, eventName, eventParameters, eventNodeParameters, when, callback ) {

                    if ( when === undefined ) {
                        return this.kernel[kernelFunctionName]( nodeID, eventName, eventParameters, eventNodeParameters );
                    } else {
                        this.kernel.plan( nodeID, kernelFunctionName, eventName,
                            [ eventParameters, eventNodeParameters ], when, callback /* ( result ) */ );
                    }

                };
    
            case "execute":

                return function( nodeID, scriptText, scriptType, when, callback ) {

                    if ( when === undefined ) {
                        return this.kernel[kernelFunctionName]( nodeID, scriptText, scriptType );
                    } else {
                        this.kernel.plan( nodeID, kernelFunctionName, undefined,
                            [ scriptText, scriptType ], when, callback /* ( result ) */ );  // TODO: { text: scriptText, type: scriptType } ? -- vwf.receive() needs to parse
                    }

                };

            case "time":
            case "client":
            case "moniker":

                return function() {
                    return this.kernel[kernelFunctionName]();
                };

        }

    }, function( modelFunctionName ) {

        // == Model API ============================================================================

        return undefined;

    } );

} );
