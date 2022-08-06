export const CustomErrorMessage = {
  NOT_SUPPORT: {
    messageCode: 'NFT import not support',
    description: 'NFT import not support',
  },
  //module notification
  'NOTIFICATION.NOT_FOUND': {
    messageCode: 'NOTIFICATION.NOT_FOUND.ID_NOT_FOUND',
    description: 'Không tìm thấy id thông báo',
  },
  'NOTIFICATION.FIND_ALL': {
    messageCode: 'NOTIFICATION.FIND_ALL',
    description: 'Không lấy được danh sách thông báo',
  },
  'NOTIFICATIONS.CREATE': {
    messageCode: 'NOTIFICATIONS.FAILED_TO_CREATE_NOTIFICATION',
    description: 'Lỗi tạo thông báo',
  },
  'NOTIFICATIONS.UPDATE_READ': {
    messageCode: 'NOTIFICATIONS.UPDATE_READ_ERROR',
    description: 'Lỗi cập nhật trạng thái đọc thông báo',
  },
  INSUFFICIENT_FUNDS: {
    messageCode: 'INSUFFICIENT_FUNDS',
    description: 'không đủ phí gas * price + value',
  },
  'NOTIFICATION.ACTION.NOT_FOUND': {
    messageCode: 'NOTIFICATION.ACTION.NOT_FOUND',
    description: 'Không tìm thấy danh sách thông báo tương ứng',
  },

  //module activity
  'ACTIVITY.NOT_FOUND': {
    messageCode: 'ACTIVITY.ACTIVITY_NOT_FOUND',
    description: 'Không tìm thấy id hoạt động',
  },
  // module categories
  'CATEGORY.NOT_FOUND': {
    messageCode: 'CATEGORY.CATEGORY_NOT_FOUND',
    description: 'Không tìm thấy danh mục',
  },

  //module collection
  'COLLECTIONS.NOT_FOUND': {
    messageCode: 'COLLECTIONS.COLLECTION_ID_NOT_FOUND',
    description: 'Không tìm thấy collection',
  },

  //module nfts
  'NFT.FAILED_TO_SAVE_TO_DATABASE': {
    messageCode: 'CREATE_NFT.FAILED_TO_SAVE_TO_DATABASE',
    description: 'Lỗi lưu NFT vào database',
  },
  'NFT.NOT_FOUND': {
    messageCode: 'NFT.NOT_FOUND.ID_NOT_FOUND',
    description: 'Không tìm thấy NFT ID',
  },
  'NFT.USER_NOT_FOUND': {
    messageCode: 'NFT.NOT_FOUND.USER_NOT_FOUND',
    description: 'Không tìm thấy user',
  },
  'NFT.USER_DOES_NOT_HAVE_PERMISSION_WITH_THIS_NFT': {
    messageCode: 'NFT.USER_DOES_NOT_HAVE_PERMISSION_WITH_THIS_NFT',
    description: 'User không có quyền với nft này',
  },
  'NFT.NFT_IMAGE_NOT_UPDATED': {
    messageCode: 'NFT.NOT_FOUND.NFT_IMAGE_NOT_UPDATED',
    description: 'Ảnh NFT không được cập nhật',
  },
  'NFT.NFT_COLLECTIONS_NOT_FOUND': {
    messageCode: 'NFT.NOT_FOUND.NFT_COLLECTIONS_NOT_FOUND',
    description: 'Không tìm thấy collection',
  },
  'NFT.NFT_COLLECTIONS_STATUS_FALSE': {
    messageCode: 'NFT.NOT_FOUND.NFT_COLLECTIONS_STATUS_FALSE',
    description: 'Sai trạng thái collection',
  },
  'NFT.NFT_COLLECTIONS_WRONG_NETWORK': {
    messageCode: 'NFT.NOT_FOUND.NFT_COLLECTIONS_STATUS_FALSE',
    description: 'Sai network với collection',
  },
  'NFT.NFT_STATUS_WRONG': {
    messageCode: 'NFT.NFT_STATUS_WRONG',
    description: 'Sai trạng thái NFT',
  },
  'NFT.USER_ID_NOT_FOUND': {
    messageCode: 'NFT.NOT_FOUND.USER_ID_NOT_FOUND',
    description: 'Không tìm thấy ID người dùng',
  },
  'NFT.INVALID_TYPE': {
    messageCode: 'NFTS.TYPE_INVALID',
    description: 'Loại NFT không hợp lệ',
  },
  'NFT.INVALID_INPUT': {
    messageCode: 'NFTS.INPUT_INVALID',
    description: 'Đầu vào không hợp lệ',
  },
  'NFTS.NFTS_IS_BELONG_TO_YOU': {
    messageCode: 'NFTS.NFTS_IS_BELONG_TO_YOU',
    description: 'NFT này là của bạn',
  },
  'NFT.NOT_SUPPORT': {
    messageCode: 'NFT.NOT_SUPPORT',
    description: 'Không hỗ trợ loại nft này',
  },
  'NFT.IS_AUTION': {
    messageCode: 'NFT.IS_AUTION',
    description: 'Nft này đang được đấu giá',
  },

  //module profile analystic
  'PROFILE_ANALYSTIC.USER_NOT_FOUND': {
    messageCode: 'PROFILE_ANALYSTIC.USER_NOT_FOUND',
    description: 'Không tìm thấy user id',
  },

  //module sale nft
  SALE_NFT_BALANCE_NOT_ENOUGH: {
    messageCode: 'SALE_NFT_BALANCE_NOT_ENOUGH',
    description: 'Số dư không đủ',
  },
  SALE_NFT_NFT_ID_NOT_FOUND: {
    messageCode: 'SALE_NFT_NFT_ID_NOT_FOUND',
    description: 'Không tìm thấy NFT',
  },
  SALE_NFT_INVALID_NFT_ID: {
    messageCode: 'SALE_NFT_INVALID_NFT_ID',
    description: 'NFT ID không hợp lệ',
  },
  SALE_NFT_BUY_SELF_NFT: {
    messageCode: 'SALE_NFT_BUY_SELF_NFT',
    description: 'Không thể mua NFT của chính mình',
  },
  SALE_NFT_INVALID: {
    messageCode: 'SALE_NFT_INVALID',
    description: 'NFT đang không được sale',
  },
  SALE_NFT_INVALID_SALE_NFT_ID: {
    messageCode: 'SALE_NFT_INVALID_SALE_NFT_ID',
    description: 'Sale NFT ID không hợp lệ',
  },
  SALE_NFT_INVALID_CANCEL_SALE_ID: {
    messageCode: 'SALE_NFT_INVALID_CANCEL_SALE_ID',
    description: 'Cancel sale NFT có ID không hợp lệ',
  },
  SALE_NFT_CAN_NOT_MAKE_OFFER: {
    messageCode: 'SALE_NFT_CAN_NOT_MAKE_OFFER',
    description: 'Không thể make offer',
  },
  SALE_NFT_CAN_NOT_MAKE_OFFER_ANYMORE: {
    messageCode: 'SALE_NFT_CAN_NOT_MAKE_OFFER_ANYMORE',
    description: 'Không thể make thêm offer',
  },
  SALE_NFT_CAN_NOT_PUT_ON_SALE: {
    messageCode: 'SALE_NFT_CAN_NOT_PUT_ON_SALE',
    description: "Can't put on sale",
  },
  SALE_NFT_CAN_NOT_PUT_ON_SALE_ANYMORE: {
    messageCode: 'SALE_NFT_CAN_NOT_PUT_ON_SALE_ANYMORE',
    description: "Can't put on sale anymore",
  },
  SALE_NFT_INFLUENCER_FEE: {
    messageCode: 'SALE_NFT_INFLUENCER_FEE',
    description: "Can't put on sale, influencer fee error",
  },
  SALE_NFT_INVALID_QUANTITY: {
    messageCode: 'SALE_NFT_INVALID_QUANTITY',
    description: 'Số lượng không hợp lệ',
  },
  SALE_NFT_MUST_PUT_ON_SALE: {
    messageCode: 'SALE_NFT_MUST_PUT_ON_SALE',
    description: 'Must put on sale before accept offer',
  },
  SALE_NFT_QUANTITY_GREATER_THAN_STOCK_QUANTITY: {
    messageCode: 'SALE_NFT_QUANTITY_GREATER_THAN_STOCK_QUANTITY',
    description: 'Số lượng lớn hơn số lượng có sẵn',
  },
  SALE_NFT_MAKE_OFFER_RECEIVE_TOKEN_NOT_SUITABLE: {
    messageCode: 'SALE_NFT_MAKE_OFFER_RECEIVE_TOKEN_NOT_SUITABLE',
    description: 'receiveToken if make offer not suitable',
  },
  SALE_NFT_MUST_OWNER_NFT_BEFORE_IGNORE_OFFER: {
    messageCode: 'SALE_NFT_MUST_OWNER_NFT_BEFORE_IGNORE_OFFER',
    description: 'Must owner nft before ignore offer',
  },
  SALE_NFT_PRICE_TOO_BIG: {
    messageCode: 'SALE_NFT_PRICE_TOO_BIG',
    description: 'input price is too big',
  },
  SALE_NFT_NOT_TYPE_1155: {
    messageCode: 'SALE_NFT_NOT_TYPE_1155',
    description: 'Wrong data type nft, cant take action',
  },
  SALE_NFT_WRONG_TOKEN: {
    messageCode: 'SALE_NFT_WRONG_TOKEN',
    description: 'Wrong token',
  },
  MAKE_OFFER_WRONG_RECEIVE_TOKEN: {
    messageCode: 'MAKE_OFFER_WRONG_RECEIVE_TOKEN',
    description: 'Wrong receive token',
  },

  //module security
  'SECURITY.EMAIL_NOT_FOUND': {
    messageCode: 'SECURITY.EMAIL_NOT_FOUND',
    description: 'Không tìm thấy email',
  },
  'SECURITY.ENABLE_EMAIL_SECURITY_FAIL': {
    messageCode: 'SECURITY.ENABLE_EMAIL_SECURITY_FAIL',
    description: 'Lỗi bật email security',
  },
  'SECURITY.BAD_REQUEST.NO_SECURITY_ENABLED': {
    messageCode: 'SECURITY.BAD_REQUEST.NO_SECURITY_ENABLED',
    description: 'Chưa bật 2FA',
  },
  'SECURITY.CAN_NOT_ENABLE_2FA': {
    messageCode: 'SECURITY.CAN_NOT_ENABLE_2FA',
    description: 'Không thể bật 2FA',
  },
  'SECURITY.CAN_NOT_DISABLE_2FA': {
    messageCode: 'SECURITY.CAN_NOT_DISABLE_2FA',
    description: 'Không thể tắt 2FA',
  },
  'SECURITY.WRONG_PASSWORD': {
    messageCode: 'SECURITY.WRONG_PASSWORD',
    description: 'Sai mật khẩu',
  },
  'SECURITY.CAN_NOT_GET_IMAGE_2FA': {
    messageCode: 'SECURITY.CAN_NOT_GET_IMAGE_2FA',
    description: 'Không lấy được ảnh 2FA',
  },
  // module user wallet
  'USER_WALLET.BALANCE_NOT_ENOUGH': {
    messageCode: 'SALE_NFT_BALANCE_NOT_ENOUGH',
    description: 'Số dư không đủ',
  },
  'USER_WALLET.STAKE_LIMIT_100': {
    messageCode: 'STAKE.STAKE_LIMIT_100',
    description: 'Số lượng tối thiểu stake là 100',
  },
  'USER_WALLET.NOT_ENOUGH_AMOUNT_TO_STAKE': {
    messageCode: 'USER_WALLET.NOT_ENOUGH_AMOUNT_TO_STAKE',
    description: 'Không đủ số lượng để stake',
  },
  'USER_WALLET.NOT_ENOUGH_AMOUNT_TO_UNSTAKE': {
    messageCode: 'USER_WALLET.NOT_ENOUGH_AMOUNT_TO_UNSTAKE',
    description: 'Không đủ số lượng để unstake',
  },
  'USER_WALLET.TX_ID_NOT_FOUND': {
    messageCode: 'USER_WALLET.TX_ID_NOT_FOUND',
    description: 'Không tìm thấy TX ID',
  },
  'USER_WALLET.WRONG_TYPE': {
    messageCode: 'USER_WALLET.WRONG_TYPE',
    description: 'Wrong wallet type',
  },

  //module user
  'USER.USER_NOT_FOUND': {
    messageCode: 'USER.USER_NOT_FOUND',
    description: 'Không tìm thấy user',
  },
  'USER.USER_NOT_WORKING': {
    messageCode: 'USER.USER_NOT_WORKING',
    description: 'User không hoạt động',
  },
  'USER.USER_ALREADY_EXIST': {
    messageCode: 'USER.USER_ALREADY_EXIST',
    description: 'User này đã tồn tại',
  },
  'USER.USER_FAVORITIES_NOT_FOUND': {
    messageCode: 'USER.USER_FAVORITIES_NOT_FOUND',
    description: 'Kiểu dữ liệu không hợp lệ',
  },
  'USER.FOLLOW_FAIL': {
    messageCode: 'USER.FOLLOW_FAIL',
    description: 'Theo dõi người dùng thất bại',
  },
  'USER.USER_WITH_EMAIL_NOT_EXIST': {
    messageCode: 'USER.USER_WITH_EMAIL_NOT_EXIST',
    description: 'Không tìm thấy người dùng với email này',
  },
  'USER.UNFOLLOW_FAIL': {
    messageCode: 'USER.UNFOLLOW_FAIL',
    description: 'Bỏ theo dõi người dùng thất bại',
  },
  'USER.MUST_BE_COMMON': {
    messageCode: 'USER.MUST_BE_COMMON',
    description: 'Người dùng phải là common',
  },
  'USER.NEW_PASSWORD_CAN_NOT_BE_THE_SAME_AS_OLD_PASSWORD': {
    messageCode: 'USER.NEW_PASSWORD_CAN_NOT_BE_THE_SAME_AS_OLD_PASSWORD',
    description: 'Mật khẩu mới không được trùng mật khẩu cũ',
  },
  'USER.OLD_PASSWORD_INCORRECT': {
    messageCode: 'USER.OLD_PASSWORD_INCORRECT',
    description: 'Sai mật khẩu cũ',
  },
  'USER.CURRENT_TOP_VERIFIED': {
    messageCode: 'USER.CURRENT_TOP_VERIFIED',
    description: 'User hiện đang là top verified',
  },
  'USER.SIGNATURE_RECOVER_ADDRESS_NOT_MATCH': {
    messageCode: 'USER.SIGNATURE_RECOVER_ADDRESS_NOT_MATCH',
    description: 'Recover address from signature not match',
  },
  'USER.USER_IS_NOT_A_ARTIST': {
    messageCode: 'USER.USER_IS_NOT_A_ARTIST',
    description: 'User này không phải là artist',
  },
  'USER.USER_WITH_EMAIL_ALREADY_EXIST': {
    messageCode: 'USER.USER_WITH_EMAIL_ALREADY_EXIST',
    description: 'Email này đã được sử dụng',
  },
  'USER.USER_WITH_TWITTER_ALREADY_EXIST': {
    messageCode: 'USER.USER_WITH_TWITTER_ALREADY_EXIST',
    description: 'Twitter này đã được sử dụng',
  },
  'USER.USER_ALREADY EXISTS': {
    messageCode: 'USER.USER_ALREADY EXISTS',
    description: 'Usernam này đã được sử dụng',
  },
  //Module auth
  'AUTH.USER_NOT_FOUND': {
    messageCode: 'AUTH.USER_NOT_FOUND',
    description: 'Không tìm thấy user',
  },
  'AUTH.AUTH_ERROR': {
    messageCode: 'AUTH.AUTH_ERROR',
    description: 'AUTH_ERROR',
  },
  'AUTH.INCORRECT_EMAIL_OR_PASSWORD': {
    messageCode: 'AUTH.INCORRECT_EMAIL_OR_PASSWORD',
    description: 'Sai tài khoản hoặc mật khẩu',
  },

  //module withdraw
  'WITHDRAW.WRONG_ADDRESS_FORMAT': {
    messageCode: 'WITHDRAW.WRONG_ADDRESS_FORMAT',
    description: 'Sai định dạng ví',
  },
  'WITHDRAW.AMOUNT_LOWER_THAN_0': {
    messageCode: 'WITHDRAW.AMOUNT_LOWER_THAN_0',
    description: 'Số lượng nhỏ hơn 0',
  },
  'WITHDRAW.BNB_BALANCE_NOT_ENOUGH': {
    messageCode: 'WITHDRAW.BNB_BALANCE_NOT_ENOUGH',
    description: 'Số dư BNB không đủ',
  },
  'WITHDRAW.BALANCE_NOT_ENOUGH': {
    messageCode: 'WITHDRAW.BALANCE_NOT_ENOUGH',
    description: 'Số dư không đủ',
  },
  'TRANSACTION.TXHASH_EXISTED': {
    messageCode: 'TRANSACTION.TXHASH_EXISTED',
    description: 'TxHash existed in db',
  },

  //module STAKE NFT
  'STAKE_NFT.BALANCE_NOT_ENOUGH': {
    messageCode: 'STAKE_NFT.BALANCE_NOT_ENOUGH',
    description: 'Số dư không đủ để stake NFT',
  },
  'UNSTAKE_NFT.BALANCE_NOT_ENOUGH': {
    messageCode: 'UNSTAKE_NFT.BALANCE_NOT_ENOUGH',
    description: 'Số dư không đủ để unstake nft',
  },

  //module validate nfts interceptor
  'VALIDATE_NFT.PRICE_IS_NOT_ALLOWED_TO_BE_INCLUDED_IN_THIS_REQUEST': {
    messageCode:
      'VALIDATE_NFT.PRICE_IS_NOT_ALLOWED_TO_BE_INCLUDED_IN_THIS_REQUEST',
    description: 'Giá không được kèm trong request này',
  },
  'VALIDATE_NFT.QUANTITY_IS_NOT_ALLOWED_TO_BE_INCLUDED_IN_THIS_REQUEST': {
    messageCode:
      'VALIDATE_NFT.QUANTITY_IS_NOT_ALLOWED_TO_BE_INCLUDED_IN_THIS_REQUEST',
    description: 'Số lượng không được kèm trong request này',
  },
  'VALIDATE_NFT.COLLECTION_DOES_NOT_BELONG_TO_THIS_USER': {
    messageCode: 'VALIDATE_NFT.COLLECTION_DOES_NOT_BELONG_TO_THIS_USER',
    description: 'Collection không thuộc về user này',
  },
  'VALIDATE_NFT.PUMPKIN_MUST_BE_GREATER_THAN_1': {
    messageCode: 'VALIDATE_NFT.PUMPKIN_MUST_BE_GREATER_THAN_1',
    description: 'Pumpkin phải lớn hơn 1',
  },
  'VALIDATE_NFT.THIS_USER_IS_NOT_ALLOWED_TO_CHOOSE_TOP_CREATION': {
    messageCode: 'VALIDATE_NFT.THIS_USER_IS_NOT_ALLOWED_TO_CHOOSE_TOP_CREATION',
    description: 'user này không được chọn top creation',
  },
  'VALIDATE_NFT.NUMBER_OF_COPY_MUST_BE_EQUAL_TO_QUANTITY': {
    messageCode: 'VALIDATE_NFT.NUMBER_OF_COPY_MUST_BE_EQUAL_TO_QUANTITY',
    description: 'Số lượng copy phải bằng số lượng putonfarm',
  },

  'VALIDATE_NFT.NUMBER_OF_COPIES_OVER_ACCEPTED_AMOUNT': {
    messageCode: 'VALIDATE_NFT.NUMBER_OF_COPIES_OVER_ACCEPTED_AMOUNT',
    description: 'Số lượng bản sao nhiều hơn số lượng được cho phép',
  },

  'SUPPORT.NOT_FOUND_NEW_COLLECTION_TYPE': {
    messageCode: 'SUPPORT.NOT_FOUND_NEW_COLLECTION_TYPE',
    description: 'Không tìm thấy collection',
  },

  'SUPPORT.NOT_FOUND_LANGUAGE': {
    messageCode: 'SUPPORT.NOT_FOUND_LANGUAGE',
    description: 'Không tìm thấy ngôn ngữ',
  },

  'USER.IS_EMPTY_BANNER_URI': {
    messageCode: 'USER.IS_EMPTY_BANNER_URI',
    description: `User's banner uri is empty`,
  },

  'SALE_NFT.CAN_NOT_GET_EXCHANGE_RATE': {
    messageCode: 'SALE_NFT.CAN_NOT_GET_EXCHANGE_RATE',
    description: `Can not get exchange rate`,
  },

  'REPORT.CREATE_REPORT_NFT_FAIL': {
    messageCode: 'REPORT.CREATE_REPORT_NFT_FAIL',
    description: `Create report nft fail`,
  },

  'REPORT.CREATE_REPORT_USER_FAIL': {
    messageCode: 'REPORT.CREATE_REPORT_USER_FAIL',
    description: `Create report user fail`,
  },

  'REPORT.CREATE_REPORT_BUG_FAIL': {
    messageCode: 'REPORT.CREATE_REPORT_BUG_FAIL',
    description: `Create report bug fail`,
  },

  'CATEGORY.CREATE_CATEGORY_BUG_FAIL': {
    messageCode: 'CATEGORY.CREATE_CATEGORY_BUG_FAIL',
    description: `Create category bug fail`,
  },

  'CATEGORY.CATEGORY_BUG_NOT_FOUND': {
    messageCode: 'CATEGORY.CATEGORY_BUG_NOT_FOUND',
    description: `Category bug not found`,
  },

  //module banner

  'BANNER.NOT_FOUND': {
    messageCode: 'Banner is not found',
  },

  //module resources

  'RESOURCE.NOT_FOUND': {
    messageCode: 'Resource is not found',
  },

  'HELPER_CENTER.NOT_FOUND': {
    messageCode: 'Helper center is not found',
  },

  'HELPER_CENTER.TYPE_IS_REQUIRED': {
    messageCode: 'Helper center type is required',
  },

  //module nftversion
  'NFT_VERSION.NOT_FOUND': {
    messageCode: 'Nft version is not found',
  },
  NFT_VERSION_CAN_NOT_PUT_ON_SALE_ANYMORE: {
    messageCode: 'NFT_VERSION_CAN_NOT_PUT_ON_SALE_ANYMORE',
    description: "Can't put on sale anymore",
  },
  NFT_VERSION_WRONG_TYPE: {
    messageCode: 'NFT_VERSION_WRONG_TYPE',
    description: 'NFT version wrong type',
  },

  //module auction
  'AUCTION.NOT_FOUND': {
    messageCode: 'AUCTION.NOT_FOUND',
    description: 'Auction is not found',
  },
  'AUCTION.USER_NOT_HAVE_PERMISSION': {
    messageCode: 'AUCTION.USER_NOT_HAVE_PERMISSION',
    description: 'User not have permission',
  },
  'AUCTION.BID_NOT_FOUND': {
    messageCode: 'AUCTION.BID_NOT_FOUND',
    description: 'Bid auction is not found',
  },
  'AUCTION.USER_NOT_HAVE_PERMISSION_WITH_BID': {
    messageCode: 'AUCTION.USER_NOT_HAVE_PERMISSION_WITH_BID',
    description: 'User not have permission with this bid',
  },
  'AUCTION.STEP_PRICE_ERROR': {
    messageCode: 'AUCTION.STEP_PRICE_ERROR',
    description: 'Trả giá thấp hơn cho phép',
  },
  'AUCTION.WRONG_OBJECT_BID': {
    messageCode: 'AUCTION.WRONG_OBJECT_BID',
    description: 'Sai đối tượng đấu giá',
  },
  'AUCTION.RECLAIMED_NFT': {
    messageCode: 'AUCTION.RECLAIMED_NFT',
    description: 'Auction reclaimed nft',
  },
  'AUCTION.ACCEPTED_NFT': {
    messageCode: 'AUCTION.ACCEPTED_NFT',
    description: 'Auction accepted nft',
  },
  'AUCTION.NFT_HAS_CENSOR': {
    messageCode: 'AUCTION.NFT_HAS_CENSOR',
    description: 'This NFT has been censored. Contact us for more details',
  },

  //module network
  'NETWORK.NOT_FOUND': {
    messageCode: 'NETWORK.NOT_FOUND_ID_NOT_FOUND',
    description: 'Không tìm thấy network id',
  },

  //module network token
  'NETWORK_TOKEN.NOT_FOUND': {
    messageCode: 'NETWORK_TOKEN.NOT_FOUND_ID_NOT_FOUND',
    description: 'Không tìm thấy network token id',
  },
  'NETWORK_TOKEN.WRONG': {
    messageCode: 'NETWORK_TOKEN.WRONG',
    description: 'network token wrong',
  },

  //module whitelist user
  'WHITELIST_USER.NOT_FOUND': {
    messageCode: 'WHITELIST_USER.NOT_FOUND_ID_NOT_FOUND',
    description: 'Không tìm thấy whitelist user',
  },

  //module artist user
  'ARTIST.NOT_FOUND': {
    messageCode: 'ARTIST.NOT_FOUND_ID_NOT_FOUND',
    description: 'Không tìm thấy artist',
  },

  //module admin
  'ADMIN.WRONG_ROLE': {
    messageCode: 'USER.NOT_HAVE_THE_ROLE_OF_ADMIN',
    description: 'User không phải là Admin',
  },

  //edit order
  SALE_ID_INVALID: {
    messageCode: 'SALE ID INVALID',
    description: 'Sale id không hợp lệ',
  },

  //verify twitter
  'USER.VERIFY_FAILED': {
    messageCode: 'USER.VERIFY_FAILED_BECAUSE_EMAIL_DOES_NOT_EXIST',
    description: 'User verify không thành công do email không tồn tại',
  },
};
