"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.treatQuotesUpdate = treatQuotesUpdate;
/**
 * Created by vadimsky on 31/10/16.
 */
var DirectionType = {
    UP: 1,
    DOWN: 2
};

function treatQuotesUpdate(quotes, messages, prevAssets, assetsNames) {
    if (!messages) {
        return [];
    }

    var assets = [];
    var ordersBook = [];

    for (var i = 0; i < messages.length; i++) {
        var message = messages[i];

        var asset = {
            id: i + 1,
            name: assetsNames[i + 1].name,
            direction: prevAssets.direction,
            quote: quotes[i][0].Close,
            time: Date.parse(quotes[5][0].Date),
            active: true
        };

        asset.direction = calcDirection(prevAssets[i], asset);

        assets.push(asset);
        if (message === null || typeof message === "undefined" || !message.length) {
            asset.active = false;
            continue;
        }

        //Order Books
        // -----------------------------------------
        for (var i1 = 0; i1 < message.length; i1++) {
            var expirySet = message[i1];
            for (var i2 = 0; i2 < expirySet.length; i2++) {
                var ordersSet = expirySet[i2];
                for (var k = 0; k < ordersSet.length; k++) {
                    if (typeof ordersSet[k] !== "undefined") {
                        var order = composeOffer(ordersSet[k]);
                        order.assetName = assetsNames[order.assetId];
                        ordersBook.push(order);
                    }
                }
            }
        }
    }
    return {
        assets: assets,
        ordersBook: ordersBook
    };
}

function calcDirection(a, b) {
    if (typeof a === "undefined" || a == null) {
        return DirectionType.UP;
    }

    if (a.quote < b.quote) {
        return DirectionType.UP;
    }

    if (a.quote > b.quote) {
        return DirectionType.DOWN;
    }

    return a.direction;
}

function composeOffer(message) {
    return {
        assetId: message.AssetId,
        offerId: message.OfferId,
        writerId: message.WriterId,
        expiryTime: message.ExpiryTime,
        direction: message.Direction,
        investment: message.Investment,
        writerPayout: message.WriterPayout,
        BuyerPayout: message.BuyerPayout,
        writerProfit: message.WriterProfit,
        status: message.Status,
        createdTime: Date.parse(message.CreatedTime),
        buyerRestAmount: message.BuyerRestAmount,
        writerRestAmount: message.WriterRestAmount,
        IsActionable: message.IsActionable,
        autoConfigId: message.AutoConfigId
    };
}